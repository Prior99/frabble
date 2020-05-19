import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed } from "mobx";
import classnames from "classnames";
import { CellPositionType } from "../../types";
import "./game-stand.scss";
import { GameCellConnected } from "../game-cell-connected";
import { Stand } from "../../game-logic/stand";

export interface GameStandProps {
    className?: string;
    playerId: string;
}

@external
@observer
export class GameStand extends React.Component<GameStandProps> {
    @inject private game!: Game;

    @computed private get stand(): Stand | undefined {
        return this.game.stands.get(this.props.playerId);
    }

    @computed private get classNames(): string {
        return classnames("GameStand", this.props.className);
    }

    @computed private get cells(): JSX.Element[] {
        const result: JSX.Element[] = [];
        for (let index = 0; index < (this.stand?.maxIndex ?? 0); ++index) {
            result.push(
                <GameCellConnected
                    key={index}
                    className="GameStand__cell"
                    position={{ positionType: CellPositionType.STAND, index, playerId: this.props.playerId }}
                />,
            );
        }
        return result;
    }

    public render(): JSX.Element {
        return <div className={this.classNames}>{this.cells}</div>;
    }
}
