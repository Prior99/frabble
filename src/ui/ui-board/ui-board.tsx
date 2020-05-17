import * as React from "react";
import { UiCell } from "../ui-cell";
import { Board } from "../../game-logic/board";
import { computed } from "mobx";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./ui-board.scss";

export interface UiBoardProps {
    className?: string;
}

@observer
export class UiBoard extends React.Component<UiBoardProps> {
    private board = new Board();

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (const { cell, mode, position } of this.board.iterator()) {
            result.push(<UiCell key={`${position.x}-${position.y}`} className="Board__cell" cell={cell} mode={mode} />);
        }
        return result;
    }

    @computed private get classNames(): string {
        return classNames("Board", this.props.className);
    }

    public render() {
        return (
            <div className={this.classNames}>
                <div className="Board__container">
                    <div className="Board__cells">{this.cells}</div>
                </div>
            </div>
        );
    }
}
