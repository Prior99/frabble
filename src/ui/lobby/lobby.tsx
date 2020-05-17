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

    @action.bound private handleLanguageChange(_: unknown, { value }: DropdownProps) {
        this.game.config.language = value as Language;
    }

    @action.bound private handleTimeLimitChange(evt: React.SyntheticEvent<HTMLInputElement>) {
        const value = evt.currentTarget.value;
        const parsed = Number(value);
        if (!value || isNaN(parsed)) {
            return;
        }
        this.game.config.timeLimit = parsed;
    }

    @action.bound private handleTimeLimitToggle() {
        if (this.game.config.timeLimit === undefined) {
            this.game.config.timeLimit = 60;
            return;
        }
        this.game.config.timeLimit = undefined;
    }

    @action.bound private handleStartClick() {
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

    @action.bound private async handleIdClick() {
        if (this.hasClipboardApi) {
            const anyNavigator = navigator as any;
            await anyNavigator.clipboard.writeText(this.connectUrl);
        }
    }

    @computed private get hasClipboardApi() {
        const anyNavigator = navigator as any;
        return Boolean(anyNavigator.clipboard);
    }

    @computed private get connectUrl() {
        return location.href.replace(location.hash, `#/game/client/${this.game.peer?.networkId}`);
    }

    @computed private get popupText() {
        if (this.hasClipboardApi) {
            return "Copied to clipboard.";
        }
        return `Can't copy to clipboard: "${this.connectUrl}".`;
    }

    public render() {
        return (
            <MenuContainer className={this.props.className}>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Popup
                                on="click"
                                trigger={
                                    <Message
                                        icon="globe"
                                        color="blue"
                                        onClick={this.handleIdClick}
                                        content={this.game.peer?.networkId}
                                        className="Lobby__idMessage"
                                    />
                                }
                                content={this.popupText}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Segment>
                                <h1>Lobby</h1>
                                <h2>Players</h2>
                                <List>
                                    {this.game.users.all.map(({ id, name }) => (
                                        <List.Item
                                            key={id}
                                            content={name}
                                            icon={id === this.game.users.ownUser.id ? "circle" : "circle outline"}
                                        />
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
                                            <Form.Button primary fluid onClick={this.handleStartClick}>
                                                Start
                                            </Form.Button>
                                        </Form>
                                    </>
                                ) : (
                                    <p>Please wait <b>patiently</b> for the host to start the game...</p>
                                )}
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </MenuContainer>
        );
    }
}
