import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { DndProvider } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import { GameState } from "../../types";
import "./game-container.scss";
import { Game, LoadingFeatures } from "../../game";
import { invariant } from "../../utils";
import { Lobby, GameBoard, GameStand } from "../../ui";
import { Button, Segment, Popup, Progress } from "semantic-ui-react";
import { action, computed } from "mobx";
import { Scoreboard } from "../scoreboard/scoreboard";
import { Status } from "../status";
import { GameOver } from "../game-over";
import { NetworkMode } from "p2p-networking";

export interface GameContainerProps {
    className?: string;
}

@external
@observer
export class GameContainer extends React.Component<GameContainerProps> {
    @inject private game!: Game;

    @action.bound private handleCommit(): void {
        this.game.endTurn();
    }

    @action.bound private startPassing(): void {
        this.game.startPassing();
    }

    @action.bound private confirmPassing(): void {
        this.game.confirmPassing();
    }

    @action.bound private abortPassing(): void {
        this.game.abortPassing();
    }

    @computed private get canEndTurn(): boolean {
        if (this.game.isGameOver) {
            return false;
        }
        return this.game.user?.id === this.game.currentUserId && this.game.canEndTurn;
    }

    @computed private get canPass(): boolean {
        if (this.game.isGameOver) {
            return false;
        }
        return this.game.user?.id === this.game.currentUserId && this.game.canPass;
    }

    @computed private get isPassing(): boolean {
        return this.game.isPassing;
    }

    @computed private get buttonPopupContent(): string {
        return this.game.endTurnMessage;
    }

    @computed private get showRestart(): boolean {
        return this.game.networkMode === NetworkMode.HOST && this.game.isGameOver;
    }

    @action.bound private handleRestart(): void {
        this.game.restart();
    }

    @computed private get passLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.PASS);
    }

    @computed private get nextTurnLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.NEXT_TURN);
    }

    @computed private get restartLoading(): boolean {
        return this.game.loading.has(LoadingFeatures.RESTART);
    }

    public render(): JSX.Element {
        switch (this.game.state) {
            case GameState.LOBBY:
                return <Lobby className="GameContainer__lobby" />;
            case GameState.STARTED:
                return (
                    <DndProvider options={HTML5toTouch}>
                        <div className="GameContainer">
                            <div className="GameContainer__container">
                                <div className="GameContainer__mainArea">
                                    <Segment className="GameContainer__boardContainer">
                                        <GameOver />
                                        <GameBoard className="GameContainer__board" />
                                    </Segment>

                                    <Popup
                                        header="Passing"
                                        content="Select the letters to exchange or just click confirm."
                                        open={this.isPassing}
                                        inverted
                                        trigger={
                                            <Segment className="GameContainer__standContainer">
                                                <GameStand
                                                    playerId={this.game.user?.id ?? ""}
                                                    className="GameContainer__stand"
                                                />
                                            </Segment>
                                        }
                                    />
                                </div>
                                <div className="GameContainer__sidebar">
                                    <div className="GameContainer__statusContainer">
                                        <Segment className="GameContainer__sidebarSegment">
                                            <Status className="GameContainer__status" />
                                            {this.game.showProgress && !this.game.paused && (
                                                <Progress
                                                    className="GameContainer__progress"
                                                    percent={this.game.progressPercent}
                                                    content={`${this.game.secondsLeft}s`}
                                                    color={
                                                        this.game.currentUserId === this.game.user?.id
                                                            ? "blue"
                                                            : undefined
                                                    }
                                                    error={
                                                        this.game.currentUserId === this.game.user?.id &&
                                                        this.game.progressPercent > 80
                                                    }
                                                />
                                            )}
                                        </Segment>
                                    </div>
                                    <div className="GameContainer__scoreboardContainer">
                                        <Segment className="GameContainer__sidebarSegment">
                                            <Scoreboard className="GameContainer__scoreboard" />
                                        </Segment>
                                    </div>
                                    <div className="GameContainer__actions">
                                        <Segment className="GameContainer__sidebarSegment">
                                            {
                                                this.showRestart ? (
                                                    <>
                                                        <Button
                                                            fluid
                                                            icon="redo"
                                                            loading={this.restartLoading}
                                                            disable={this.restartLoading}
                                                            labelPosition="left"
                                                            size="big"
                                                            content="Play again"
                                                            onClick={this.handleRestart}
                                                            primary
                                                            className="GameContainer__commitButton"
                                                        />
                                                        <p />
                                                    </>
                                                ) : <></>
                                            }
                                            <Popup
                                                header="Cannot end turn"
                                                content={this.buttonPopupContent}
                                                disabled={this.canEndTurn}
                                                inverted
                                                trigger={
                                                    <span>
                                                        <Button
                                                            fluid
                                                            loading={this.nextTurnLoading}
                                                            disabled={!this.canEndTurn || this.nextTurnLoading}
                                                            icon="thumbs up"
                                                            labelPosition="left"
                                                            size="big"
                                                            content="End turn"
                                                            onClick={this.handleCommit}
                                                            primary
                                                            className="GameContainer__commitButton"
                                                        />
                                                    </span>
                                                }
                                            />
                                            <p />
                                            {this.isPassing ? (
                                                <Button.Group fluid size="big">
                                                    <Button
                                                        loading={this.passLoading}
                                                        disabled={this.passLoading}
                                                        content="Okay"
                                                        icon="check"
                                                        labelPosition="left"
                                                        positive
                                                        className="GameContainer__confirmButton"
                                                        primary
                                                        onClick={this.confirmPassing}
                                                    />
                                                    <Button.Or />
                                                    <Button
                                                        loading={this.passLoading}
                                                        disabled={this.passLoading}
                                                        content="Abort"
                                                        icon="cancel"
                                                        labelPosition="right"
                                                        className="GameContainer__abortButton"
                                                        primary
                                                        onClick={this.abortPassing}
                                                    />
                                                </Button.Group>
                                            ) : (
                                                <Button
                                                    fluid
                                                    loading={this.passLoading}
                                                    disabled={!this.canPass || this.passLoading}
                                                    icon="step forward"
                                                    labelPosition="left"
                                                    size="big"
                                                    content="Pass"
                                                    onClick={this.startPassing}
                                                    className="GameContainer__passButton"
                                                />
                                            )}
                                        </Segment>
                                    </div>
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
