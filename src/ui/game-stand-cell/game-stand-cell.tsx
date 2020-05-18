import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed, action, observable } from "mobx";
import classnames from "classnames";
import {
    GameCellDnd,
    GameCellDndMode,
    DropInfo,
} from "../game-cell-dnd";
import { CellMode, CellPositionStand, Letter } from "../../types";
import "./game-stand-cell.scss";

export interface GameStandCellProps {
    className?: string;
    position: CellPositionStand;
    onDrop: (info: DropInfo) => boolean;
}

@external
@observer
export class GameStandCell extends React.Component<GameStandCellProps> {
    @inject private game!: Game;

    @observable private dragging = false;

    @computed private get letter(): Letter | undefined {
        return this.game.getLetter(this.props.position);
    }

    @computed private get classNames() {
        return classnames({
            "GameStandCell": true,
            "GameStandCell--dragging": this.dragging,
        }, this.props.className);
    }

    @action.bound private handleDragStart() {
        this.dragging = true;
    }

    @action.bound private handleDragStop() {
        this.dragging = false;
    }

    public render(): JSX.Element {
        if (this.letter === undefined) {
            return <GameCellDnd
                cellMode={CellMode.STANDARD}
                className={this.classNames}
                dragMode={GameCellDndMode.TARGET}
                onDrop={this.props.onDrop}
                position={this.props.position}
            />
        }
        return (
            <GameCellDnd
                letter={this.letter}
                cellMode={CellMode.STANDARD}
                className={this.classNames}
                dragMode={GameCellDndMode.SOURCE}
                onDragStart={this.handleDragStart}
                onDragStop={this.handleDragStop}
                position={this.props.position}
            />
        );
    }
}

