import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { DndProvider } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import { GameState } from "../../types";
import "./game-container.scss";
import { Game } from "../../game";
import { invariant } from "../../utils";
import { Lobby, GameBoard, GameStand } from "../../ui";
import { Button, Segment } from "semantic-ui-react";
import { action } from "mobx";
import { Scoreboard } from "../scoreboard/scoreboard";
import { Status } from "../status";

export interface GameContainerProps {
    className?: string;
}

@external
@observer
export class GameContainer extends React.Component<GameContainerProps> {
    @inject private game!: Game;

    @action.bound private handleCommit() {
        this.game.endTurn();
    }

    public render(): JSX.Element {
        switch (this.game.state) {
            case GameState.LOBBY:
                return <Lobby className="GameContainer__lobby" />;
            case GameState.STARTED:
                return (
                    <DndProvider options={HTML5toTouch}>
                        <div className="GameContainer">
                            <div className="GameContainer__mainArea">
                                <Segment className="GameContainer__boardContainer">
                                    <GameBoard className="GameContainer__board" />
                                </Segment>
                                <Segment className="GameContainer__standContainer">
                                    <GameStand playerId={this.game.users.ownUser.id} className="GameContainer__stand" />
                                </Segment>
                            </div>
                            <div className="GameContainer__sidebar">
                                <div className="GameContainer__statusContainer">
                                    <h2>Status</h2>
                                    <Status className="GameContainer__status" />
                                </div>
                                <div className="GameContainer__scoreboardContainer">
                                    <h2>Scoreboard</h2>
                                    <Scoreboard className="GameContainer__scoreboard" />
                                </div>
                                <div className="GameContainer__actions">
                                    <h2>Actions</h2>
                                    <Button
                                        disabled={this.game.users.ownUser.id !== this.game.currentUserId}
                                        icon="play"
                                        labelPosition="left"
                                        primary
                                        size="big"
                                        content="End turn"
                                        onClick={this.handleCommit}
                                        className="GameContainer__commitButton"
                                    />
                                </div>
                            </div>
                        </div>
                    </DndProvider>
                );
            default:
                invariant(this.game.state);
        }
    }
}