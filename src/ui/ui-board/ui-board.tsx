import * as React from "react";
import { UiCell, UiCellDragMode } from "../ui-cell";
import { Board } from "../../game-logic/board";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./ui-board.scss";
import { Cell } from "../../types";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { Vec2 } from "../../utils";

export interface UiBoardProps {
    className?: string;
}

@observer
@external
export class UiBoard extends React.Component<UiBoardProps> {
    @inject private game!: Game;

    @computed private get board() {
        return this.game.board;
    }

    @action.bound private onPlaceLetter(position: Vec2, cell: Cell): boolean {
        if (cell.empty) {
            throw new Error("Cannot drop empty tile on board.");
        }
        this.board.letterPlace(position, cell.letter, cell.playerId, cell.turn);

        return true;
    }

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (const { cell, mode, position } of this.board.iterator()) {
            result.push(
                <UiCell
                    key={`${position.x}-${position.y}`}
                    className="Board__cell"
                    cell={cell}
                    mode={mode}
                    dragMode={UiCellDragMode.TARGET}
                    onDrop={this.onPlaceLetter}
                    position={position}
                />,
            );
        }
        return result;
    }

    @computed private get classNames(): string {
        return classNames("Board", this.props.className);
    }

    public render() {
        console.log("Start board render");
        return (
            <div className={this.classNames}>
                <div className="Board__container">
                    <div className="Board__cells">{this.cells}</div>
                </div>
            </div>
        );
    }
}
