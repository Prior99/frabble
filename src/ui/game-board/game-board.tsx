import * as React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./game-board.scss";
import { CellPositionType } from "../../types";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { GameCellConnected } from "../game-cell-connected";

export interface GameBoardProps {
    className?: string;
}

@observer
@external
export class GameBoard extends React.Component<GameBoardProps> {
    @inject private game!: Game;

    @computed private get board(): Board {
        return this.game.board;
    }

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (const { position } of this.board.iterator()) {
            result.push(
                <GameCellConnected
                    key={`${position.x}-${position.y}`}
                    className="GameBoard__cell"
                    position={{ positionType: CellPositionType.BOARD, position }}
                />,
            );
        }
        return result;
    }

    @computed private get classNames(): string {
        return classNames("GameBoard", this.props.className, {
            "GameBoard--passing": this.game.isPassing
        });
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GameBoard__container">
                    <div className="GameBoard__cells">{this.cells}</div>
                </div>
            </div>
        );
    }
}
