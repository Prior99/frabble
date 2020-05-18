import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed, action } from "mobx";
import classnames from "classnames";
import {
    GameCellDnd,
    GameCellDndMode,
    DragStartInfo,
    GameCellDragResult,
    GameCellDragResultType,
    DropInfo,
} from "../game-cell-dnd";
import { CellMode, CellPositionType } from "../../types";
import "./game-stand.scss";
import { invariant } from "../../utils";
import { GameStandCell } from "../game-stand-cell";

export interface GameStandProps {
    className?: string;
    playerId: string;
}

@external
@observer
export class GameStand extends React.Component<GameStandProps> {
    @inject private game!: Game;

    @computed private get stand() {
        return this.game.stands.get(this.props.playerId);
    }

    @computed private get classNames() {
        return classnames("GameStand", this.props.className);
    }

    @action.bound private handleDrop({ targetPosition, sourcePosition }: DropInfo): boolean {
        this.game.moveCell(sourcePosition, targetPosition);
        return true;
    }

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (let index = 0; index < (this.stand?.maxIndex ?? 0); ++index) {
            result.push(
                <GameStandCell
                    key={index}
                    className="GameStand__cell"
                    position={{ positionType: CellPositionType.STAND, index, playerId: this.props.playerId }}
                    onDrop={this.handleDrop}
                />,
            );
        }
        return result;
    }

    public render(): JSX.Element {
        return <div className={this.classNames}>{this.cells}</div>;
    }
}
