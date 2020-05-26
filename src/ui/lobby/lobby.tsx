import * as React from "react";
import { external, inject } from "tsdi";
import {
    Segment,
    Form,
    Checkbox,
    StrictDropdownItemProps,
    Dropdown,
    DropdownProps,
    Input,
    Grid,
} from "semantic-ui-react";
import { computed, action, observable } from "mobx";
import { observer } from "mobx-react";
import { Language, AppUser } from "../../types";
import { MenuContainer } from "../../ui";
import { Game } from "../../game";
import "./lobby.scss";
import { getLanguages, getFlagIcon, getLanguageName } from "../../utils";
import { NetworkMode } from "p2p-networking";
import { IdMessage, UserTable } from "p2p-networking-semantic-ui-react";

export interface LobbyProps {
    className?: string;
}

@external
@observer
export class Lobby extends React.Component<LobbyProps> {
    @inject private game!: Game;

    @observable private inputName: string | undefined;

    @action.bound private handleLanguageChange(_: unknown, { value }: DropdownProps): void {
        this.game.config.language = value as Language;
    }

    @action.bound private handleTimeLimitChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        const value = evt.currentTarget.value;
        const parsed = Number(value);
        if (!value || isNaN(parsed)) {
            return;
        }
        this.game.config.timeLimit = parsed;
    }

    @action.bound private handleTimeLimitToggle(): void {
        if (this.game.config.timeLimit === undefined) {
            this.game.config.timeLimit = 60;
            return;
        }
        this.game.config.timeLimit = undefined;
    }

    @action.bound private handleStartClick(): void {
        this.game.startGame();
    }

    @computed private get languageOptions(): StrictDropdownItemProps[] {
        return getLanguages().map((language) => ({
            key: language,
            value: language,
            flag: getFlagIcon(language),
            text: getLanguageName(language),
        }));
    }

    @computed private get language(): Language {
        return this.game.config.language;
    }

    @computed private get timeLimitEnabled(): boolean {
        return this.game.config.timeLimit !== undefined;
    }

    @computed private get timeLimit(): string {
        return String(this.game.config.timeLimit ?? "");
    }

    @computed private get isHost(): boolean {
        return this.game.networkMode === NetworkMode.HOST;
    }

    @computed private get ownUser(): AppUser | undefined {
        return this.game.user;
    }

    @computed private get nameValid(): boolean {
        if (!this.ownUser) {
            return false;
        }
        return this.ownUser.name.length > 0 && this.ownUser.name.length < 24;
    }

    @computed private get name(): string {
        return this.inputName ?? this.game.user?.name ?? "";
    }

    @action.bound private async handleNameChange(evt: React.SyntheticEvent<HTMLInputElement>): Promise<void> {
        this.inputName = evt.currentTarget.value;
        await this.game.peer?.updateUser({ name: this.inputName });
    }

    public render(): JSX.Element {
        return (
            <MenuContainer className={this.props.className}>
                <Grid className="Lobby__grid">
                    <Grid.Row>
                        <Grid.Column>
                            <Segment>
                                {this.game.peer && (
                                    <UserTable basic="very" unstackable nameFactory={(user: AppUser) => user.name} peer={this.game.peer} />
                                )}
                                <Form>
                                    <Form.Field error={!this.nameValid}>
                                        <label>Change name</label>
                                        <Input value={this.name} onChange={this.handleNameChange} />
                                    </Form.Field>
                                    {this.isHost ? (
                                        <>
                                            <Form.Field>
                                                <label>Language</label>
                                                <Dropdown
                                                    selection
                                                    value={this.language}
                                                    options={this.languageOptions}
                                                    onChange={this.handleLanguageChange}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <Checkbox
                                                    className="Lobby__toggle"
                                                    checked={this.timeLimitEnabled}
                                                    onChange={this.handleTimeLimitToggle}
                                                    label="Use timer"
                                                />
                                            </Form.Field>
                                            <Form.Field disabled={!this.timeLimitEnabled}>
                                                <label>Time limit (seconds)</label>
                                                <Input value={this.timeLimit} onChange={this.handleTimeLimitChange} />
                                            </Form.Field>
                                            <Form.Button
                                                icon="play circle"
                                                labelPosition="left"
                                                primary
                                                fluid
                                                className="Lobby__startButton"
                                                onClick={this.handleStartClick}
                                                content="Start"
                                            />
                                        </>
                                    ) : (
                                        <p>
                                            Please wait <b>patiently</b> for the host to start the game...
                                        </p>
                                    )}
                                </Form>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <IdMessage
                                peer={this.game.peer}
                                urlFactory={(id) => location.href.replace(location.hash, `#/game/client/${id}`)}
                                className="Lobby__idMessage"
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </MenuContainer>
        );
    }
}
