import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Game } from "../../game";
import { Table, Icon } from "semantic-ui-react";
import classNames from "classnames";
import { computed } from "mobx";
import "./scoreboard.scss";
import { ScoreboardRow } from "../scoreboard-row";

export interface ScoreboardProps {
    className?: string;
}

@external
@observer
export class Scoreboard extends React.Component<ScoreboardProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames("Scoreboard", this.props.className);
    }

    public render(): JSX.Element {
        return (
            <Table unstackable className={this.classNames}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className="Scoreboard__rankHeader">
                            <Icon name="trophy" />
                        </Table.HeaderCell>
                        <Table.HeaderCell>Player</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right" className="Scoreboard__scoreHeader">
                            Score
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.game.scoreList.map(({ playerId }) => (
                        <ScoreboardRow key={playerId} playerId={playerId} />
                    ))}
                </Table.Body>
            </Table>
        );
    }
}
