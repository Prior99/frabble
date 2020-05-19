import * as React from "react";
import { Route, addRoute, RouteProps } from "../../routing";
import { external, inject } from "tsdi";
import { Segment, Form, Tab, Input, TabProps } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { LobbyMode, RemoteUser } from "../../types";
import { routeGame } from "../page-game";
import { bind } from "bind-decorator";
import "./page-main-menu.scss";
import { MenuContainer } from "../../ui";
import { Game } from "../../game";

declare const SOFTWARE_VERSION: string;

@external
@observer
export class PageMainMenu extends React.Component<RouteProps<{}>> {
    @inject private game!: Game;

    @observable private otherId = "";
    @observable private activeTab = 0;

    @bind private handleNameChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.game.users.setOwnUser({
            ...this.ownUser,
            name: evt.currentTarget.value,
        });
    }

    @bind private handleOtherIdChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.otherId = evt.currentTarget.value;
    }

    @bind private handleTabChange(_: unknown, { activeIndex }: TabProps): void {
        this.activeTab = activeIndex as number;
    }

    @computed private get ownUser(): RemoteUser {
        return this.game.users.ownUser;
    }

    @computed private get nameValid(): boolean {
        return this.ownUser.name.length > 0 && this.ownUser.name.length < 24;
    }

    @computed private get panes(): { menuItem: string }[] {
        return [{ menuItem: "Join" }, { menuItem: "Host" }];
    }

    public render(): JSX.Element {
        return (
            <MenuContainer className="PageMainMenu">
                <div className="PageMainMenu__header">
                    <div className="PageMainMenu__logo" />
                    <h1 className="PageMainMenu__name">Frabble</h1>
                </div>
                <Segment className="PageMainMenu__segment">
                    <Form>
                        <Form.Field error={!this.nameValid}>
                            <label>Change name</label>
                            <Input value={this.ownUser.name} onChange={this.handleNameChange} />
                        </Form.Field>
                        <Tab
                            className="PageMainMenu__tab"
                            panes={this.panes}
                            activeIndex={this.activeTab}
                            onTabChange={this.handleTabChange}
                        />
                        {this.activeTab === 0 && (
                            <>
                                <Form.Field>
                                    <label>Join</label>
                                    <Input value={this.otherId} onChange={this.handleOtherIdChange} />
                                </Form.Field>
                                <Link to={routeGame.path(LobbyMode.CLIENT, this.otherId)}>
                                    <Form.Button disabled={!this.nameValid} primary fluid>
                                        Join
                                    </Form.Button>
                                </Link>
                            </>
                        )}
                        {this.activeTab === 1 && (
                            <Link to={routeGame.path(LobbyMode.HOST)}>
                                <Form.Button disabled={!this.nameValid} primary fluid>
                                    Host
                                </Form.Button>
                            </Link>
                        )}
                    </Form>
                </Segment>
                <div className="PageMainMenu__version">{`Version #${SOFTWARE_VERSION}`}</div>
            </MenuContainer>
        );
    }
}

export const routeMainMenu: Route<{}> = addRoute({
    path: () => "/main-menu",
    pattern: "/main-menu",
    component: PageMainMenu,
});
