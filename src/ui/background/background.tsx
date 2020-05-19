import * as React from "react";
import { computed } from "mobx";
import { CellMode } from "../../types";
import { GameCell } from "../game-cell";
import "./background.scss";
import classNames from "classnames";

export interface BackgroundProps {
    className?: string;
}

function randomMode(): CellMode {
    const value = Math.random();
    if (value > 0.95) {
        return CellMode.WORD_TRIPLE;
    }
    if (value > 0.9) {
        return CellMode.LETTER_TRIPLE;
    }
    if (value > 0.8) {
        return CellMode.WORD_DOUBLE;
    }
    if (value > 0.7) {
        return CellMode.LETTER_DOUBLE;
    }
    return CellMode.STANDARD;
}

const size = 20;
const data: CellMode[] = [];
for (let x = 0; x < size * size; ++x) {
    data.push(randomMode());
}

export class Background extends React.Component<BackgroundProps> {
    @computed private get classNames(): string {
        return classNames("Background", this.props.className);
    }

    public render(): JSX.Element {
        const grids: JSX.Element[] = [];
        for (let x = 0; x < 4; ++x) {
            grids.push(
                <div className="Background__cells">
                    {data.map((mode, index) => (
                        <GameCell className="Background__cell" key={index} grayscale cellMode={mode} />
                    ))}
                </div>,
            );
        }

        return (
            <div className={this.classNames}>
                <div className="Background__floater">{grids}</div>
            </div>
        );
    }
}
