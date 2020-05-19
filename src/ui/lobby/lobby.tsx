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
    Popup,
    Message,
    Grid,
    List,
} from "semantic-ui-react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { Language, NetworkingMode } from "../../types";
import { MenuContainer } from "../../ui";
import { Game } from "../../game";
import "./lobby.scss";
import { getLanguages, getFlagIcon, getLanguageName } from "../../utils";

export interface LobbyProps {
    className?: string;
}

@external
@observer
export class Lobby extends React.Component<LobbyProps> {
    @inject private game!: Game;

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
        return this.game.networkMode === NetworkingMode.HOST;
    }

    @action.bound private async handleIdClick(): Promise<void> {
        if (this.hasClipboardApi) {
            await navigator.clipboard.writeText(this.connectUrl);
        }
    }

    @computed private get hasClipboardApi(): boolean {
        return Boolean(navigator.clipboard);
    }

    @computed private get connectUrl(): string {
        return location.href.replace(location.hash, `#/game/client/${this.game.peer?.networkId}`);
    }

    @computed private get popupText(): string {
        if (this.hasClipboardApi) {
            return "Copied to clipboard.";
        }
        return `Can't copy to clipboard: "${this.connectUrl}".`;
    }

    public render(): JSX.Element {
        return (
            <MenuContainer className={this.props.className}>
                <Grid className="Lobby__grid">
                    <Grid.Row>
                        <Grid.Column>
                            <Segment>
                                <h2>Players</h2>
                                <List as="ul">
                                    {this.game.users.all.map(({ id, name }) => (
                                        <List.Item as="li" key={id} content={name} />
                                    ))}
                                </List>
                                {this.isHost ? (
                                    <>
                                        <h2>Options</h2>
                                        <Form>
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
                                                <label>Use timer</label>
                                                <Checkbox
                                                    toggle
                                                    checked={this.timeLimitEnabled}
                                                    onChange={this.handleTimeLimitToggle}
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
                                            >
                                                Start
                                            </Form.Button>
                                        </Form>
                                    </>
                                ) : (
                                    <p>
                                        Please wait <b>patiently</b> for the host to start the game...
                                    </p>
                                )}
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Popup
                                on="click"
                                inverted
                                trigger={
                                    <Message
                                        icon="globe"
                                        onClick={this.handleIdClick}
                                        content={this.game.peer?.networkId}
                                        className="Lobby__idMessage"
                                    />
                                }
                                content={this.popupText}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </MenuContainer>
        );
    }
}
