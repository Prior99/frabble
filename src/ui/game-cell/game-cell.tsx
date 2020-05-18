import * as React from "react";
import { CellMode, Letter } from "../../types";
import { observer } from "mobx-react";
import classnames from "classnames";
import { computed } from "mobx";
import "./game-cell.scss";
import { getPointsForLetter } from "../../game-logic/letters";
import { invariant } from "../../utils";

export interface BaseGameCellProps {
    letter?: Letter;
    cellMode: CellMode;
    className?: string;
    onClick?: React.MouseEventHandler;
    hovered?: boolean;
}

export interface GameCellProps extends BaseGameCellProps {
    innerRef?: React.LegacyRef<HTMLDivElement>;
}

function OneLetterSvg({
    content,
    className,
    fontSize = 100,
    y = "50%",
}: {
    y?: string;
    fontSize?: number;
    content: string;
    className: string;
}): JSX.Element {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <text dominantBaseline="central" textAnchor="middle" fontSize={fontSize} x="50%" y={y}>
                {content}
            </text>
        </svg>
    );
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
                "GameCell--hovering": this.props.hovered,
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

    @computed get cellDescription(): string {
        switch (this.props.cellMode) {
            case CellMode.STANDARD:
                return "";
            case CellMode.LETTER_DOUBLE:
                return "2L";
            case CellMode.LETTER_TRIPLE:
                return "3L";
            case CellMode.WORD_DOUBLE:
                return "2W";
            case CellMode.WORD_TRIPLE:
                return "3W";
            case CellMode.ROOT:
                return "🟆";
            case CellMode.STAND:
                return "";
            default:
                invariant(this.props.cellMode);
        }
    }

    public render(): JSX.Element {
        return (
            <div ref={this.props.innerRef} onClick={this.props.onClick} className={this.classNames}>
                <OneLetterSvg fontSize={90} content={String(this.points)} className="GameCell__points" />
                <OneLetterSvg fontSize={80} y="55%" content={this.letter} className="GameCell__letter" />
                <OneLetterSvg fontSize={50} content={this.cellDescription} className="GameCell__description" />
            </div>
        );
    }
}
