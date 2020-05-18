import * as React from "react";
import { GameCellDnd, GameCellDndMode, DropInfo } from "../game-cell-dnd";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./game-board.scss";
import { CellPositionType } from "../../types";
import { external, inject } from "tsdi";
import { Game } from "../../game";

export interface GameBoardProps {
    className?: string;
}

@observer
@external
export class GameBoard extends React.Component<GameBoardProps> {
    @inject private game!: Game;

    @computed private get board() {
        return this.game.board;
    }

    @action.bound private onPlaceLetter({ targetPosition, sourcePosition }: DropInfo): boolean {
        this.game.moveCell(sourcePosition, targetPosition);
        return true;
    }

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (const { cell, mode, position } of this.board.iterator()) {
            result.push(
                <GameCellDnd
                    key={`${position.x}-${position.y}`}
                    className="GameBoard__cell"
                    cellMode={mode}
                    letter={!cell.empty ? cell.letter : undefined}
                    dragMode={GameCellDndMode.TARGET}
                    onDrop={this.onPlaceLetter}
                    position={{ positionType: CellPositionType.BOARD, position }}
                />,
            );
        }
        return result;
    }

    @computed private get classNames(): string {
        return classNames("GameBoard", this.props.className);
    }

    public render() {
        console.log("Start board render");
        return (
            <div className={this.classNames}>
                <div className="GameBoard__container">
                    <div className="GameBoard__cells">{this.cells}</div>
                </div>
            </div>
        );
    }
}
