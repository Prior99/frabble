import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Game } from "../../game";
import { Table, Label } from "semantic-ui-react";
import { computed } from "mobx";
import "./scoreboard-row.scss";
import { SemanticCOLORS } from "semantic-ui-react/dist/commonjs/generic";

export interface ScoreboardRowProps {
    playerId: string;
}

@external
@observer
export class ScoreboardRow extends React.Component<ScoreboardRowProps> {
    @inject private game!: Game;

    @computed private get playerName(): string {
        return this.game.users.getUser(this.props.playerId)?.name ?? "";
    }

    @computed private get score(): string {
        return (this.game.scores.get(this.props.playerId) ?? 0).toLocaleString();
    }

    @computed private get rank(): string {
        return (this.game.getRank(this.props.playerId) ?? 0).toLocaleString();
    }

    @computed private get showRibbon(): boolean {
        return this.game.users.ownUser.id === this.props.playerId || this.game.currentUserId === this.props.playerId;
    }

    @computed private get ribbonColor(): SemanticCOLORS | undefined {
        return this.game.currentUserId === this.props.playerId ? "blue" : undefined;
    }

    @computed private get scoreGain(): number {
        return this.game.currentTurnScore ?? 0;
    }

    @computed private get showScoreGain(): boolean {
        return (
            this.game.currentUserId === this.props.playerId &&
            this.game.currentTurnScore !== undefined &&
            this.game.currentTurnValid.valid
        );
    }

    public render(): JSX.Element {
        return (
            <Table.Row>
                <Table.Cell className="ScoreboardRow__rank">
                    {this.showRibbon ? (
                        <Label ribbon color={this.ribbonColor}>
                            {this.rank}
                        </Label>
                    ) : (
                        this.rank
                    )}
                </Table.Cell>
                <Table.Cell>{this.playerName}</Table.Cell>
                <Table.Cell textAlign="right" className="ScoreboardRow__score">
                    {this.score}
                    {this.showScoreGain ? <span className="ScoreboardRow__scoreGain">+{this.scoreGain}</span> : <></>}
                </Table.Cell>
            </Table.Row>
        );
    }
}
