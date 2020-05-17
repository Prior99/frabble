import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed, action } from "mobx";
import classnames from "classnames";
import { UiCell, UiCellDragMode } from "../ui-cell";
import { CellMode } from "../../types";
import "./ui-stand.scss";

export interface UiStandProps {
    className?: string;
    userId: string;
}

@external
@observer
export class UiStand extends React.Component<UiStandProps> {
    @inject private game!: Game;

    @computed private get stand() {
        return this.game.stands.get(this.props.userId);
    }

    @computed private get letters() {
        return this.stand?.letters ?? [];
    }

    @computed private get classNames() {
        return classnames("Stand", this.props.className);
    }

    @action.bound private onPlaceLetter(index: number) {
        this.stand?.letterRemove(index);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                {this.letters.map((letter, index) => (
                    <UiCell
                        key={index}
                        cell={{ empty: false, letter, playerId: this.props.userId, turn: this.game.turn }}
                        mode={CellMode.STANDARD}
                        className="Stand__cell"
                        dragMode={UiCellDragMode.SOURCE}
                        index={index}
                        onDrop={this.onPlaceLetter}
                    />
                ))}
            </div>
        );
    }
}
