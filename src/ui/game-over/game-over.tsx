import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed } from "mobx";
import "./game-over.scss";

@observer
@external
export class GameOver extends React.Component {
    @inject private game!: Game;

    @computed private get score(): number {
        if (!this.game.user) {
            return 0;
        }
        return this.game.scores.get(this.game.user.id) ?? 0;
    }

    @computed private get rank(): number {
        return this.game.scoreList.findIndex(({ playerId }) => playerId === this.game.user?.id) + 1;
    }

    public render(): JSX.Element {
        if (!this.game.isGameOver) {
            return <></>;
        }
        return (
            <div className="GameOver">
                <div className="GameOver__ribbon">
                    <div className="GameOver__title">{this.rank === 1 ? "Winner" : `Placed #${this.rank}`}</div>
                    <div className="GameOver__score">{`You scored ${this.score} points.`}</div>
                </div>
            </div>
        );
    }
}
