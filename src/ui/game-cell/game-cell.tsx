import * as React from "react";
import { CellMode, Letter } from "../../types";
import { observer } from "mobx-react";
import classnames from "classnames";
import { computed } from "mobx";
import "./game-cell.scss";
import { getPointsForLetter } from "../../game-logic/letters";

export interface BaseGameCellProps {
    letter?: Letter;
    cellMode: CellMode;
    className?: string;
}

export interface GameCellProps extends BaseGameCellProps {
    innerRef?: React.LegacyRef<HTMLDivElement>;
}

@observer
export class GameCell extends React.Component<GameCellProps> {
    @computed private get empty(): boolean {
        return this.props.letter === undefined;
    }

    @computed private get classNames(): string {
        const { cellMode } = this.props;
        return classnames(
            {
                GameCell: true,
                "GameCell--empty": this.empty,
                "GameCell--content": !this.empty,
            },
            `GameCell--${cellMode}`,
            this.props.className,
        );
    }

    @computed private get letter(): string {
        const { letter } = this.props;
        return letter?.toUpperCase() ?? "";
    }

    @computed private get points(): number {
        const { letter } = this.props;
        if (this.empty) {
            return 0;
        }
        return getPointsForLetter(letter!);
    }

    public render(): JSX.Element {
        return (
            <div ref={this.props.innerRef} className={this.classNames}>
                <div className="GameCell__points">{this.points}</div>
                <div className="GameCell__letter">{this.letter}</div>
            </div>
        );
    }
}
