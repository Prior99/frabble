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
import { CellMode, Letter, CellPosition, CellPositionType } from "../../types";
import "./game-cell-connected.scss";
import { invariant } from "../../utils";

export interface GameCellConnectedProps {
    className?: string;
    position: CellPosition;
}

@external
@observer
export class GameCellConnected extends React.Component<GameCellConnectedProps> {
    @inject private game!: Game;

    @observable private dragging = false;

    @computed private get letter(): Letter | undefined {
        return this.game.getLetter(this.props.position);
    }

    @computed private get classNames() {
        return classnames({
            "GameCellConnected": true,
            "GameCellConnected--dragging": this.dragging,
        }, this.props.className);
    }

    @action.bound private handleDrop({ targetPosition, sourcePosition }: DropInfo): boolean {
        this.game.moveCell(sourcePosition, targetPosition);
        return true;
    }

    @action.bound private handleDragStart() {
        this.dragging = true;
    }

    @action.bound private handleDragStop() {
        this.dragging = false;
    }

    @computed private get cellMode(): CellMode {
        const { position } = this.props;
        switch (position.positionType) {
            case CellPositionType.BOARD:
                return this.game.board.cellModeAt(position.position);
            case CellPositionType.STAND:
                return CellMode.STAND;
            default: invariant(position);
        }
    }

    public render(): JSX.Element {
        if (this.letter === undefined) {
            return <GameCellDnd
                cellMode={this.cellMode}
                className={this.classNames}
                dragMode={GameCellDndMode.TARGET}
                onDrop={this.handleDrop}
                position={this.props.position}
            />
        }
        return (
            <GameCellDnd
                letter={this.letter}
                cellMode={this.cellMode}
                className={this.classNames}
                dragMode={GameCellDndMode.SOURCE}
                onDragStart={this.handleDragStart}
                onDragStop={this.handleDragStop}
                position={this.props.position}
            />
        );
    }
}

