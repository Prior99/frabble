import React from "react";
import { Cell, CellMode } from "../../types";
import { observer } from "mobx-react";
import classnames from "classnames";
import { computed } from "mobx";
import "./ui-cell.scss";
import { getPointsForLetter } from "../../game-logic/letters";

export interface UiCellProps {
    cell: Cell;
    mode: CellMode;
    className?: string;
}

@observer
export class UiCell extends React.Component<UiCellProps> {
    @computed private get classNames(): string {
        const { cell, mode } = this.props;
        return classnames(
            {
                Cell: true,
                "Cell--empty": cell.empty,
                "Cell--content": !cell.empty,
            },
            `Cell--${mode}`,
            this.props.className,
        );
    }

    @computed private get letter(): string {
        const { cell } = this.props;
        if (cell.empty) {
            return "";
        }
        return cell.letter.toUpperCase();
    }

    @computed private get points(): number {
        const { cell } = this.props;
        if (cell.empty) {
            return 0;
        }
        return getPointsForLetter(cell.letter);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="Cell__points">{this.points}</div>
                <div className="Cell__letter">{this.letter}</div>
            </div>
        );
    }
}
