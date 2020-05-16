import * as React from "react";
import { Route, addRoute, RouteProps } from "../../routing";
import { external, inject } from "tsdi";
import { Segment, Form, Tab, Input, TabProps, Checkbox } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { LobbyMode } from "../../types";
import { routeGame } from "../page-game";
import { bind } from "bind-decorator";
import "./page-main-menu.scss";
import { MenuContainer } from "../../ui";
import { Game } from "../../game";

@external
@observer
export class PageMainMenu extends React.Component<RouteProps<{}>> {
    @inject private game!: Game;

    @observable private otherId = "";
    @observable private activeTab = 0;

    @bind private handleNameChange(evt: React.SyntheticEvent<HTMLInputElement>) {
        this.game.users.setOwnUser({
            ...this.ownUser,
            name: evt.currentTarget.value,
        });
    }

    @bind private handleOtherIdChange(evt: React.SyntheticEvent<HTMLInputElement>) {
        this.otherId = evt.currentTarget.value;
    }

    @bind private handleTabChange(_: unknown, { activeIndex }: TabProps) {
        this.activeTab = activeIndex as number;
    }

    @computed private get ownUser() {
        return this.game.users.ownUser;
    }

    private get nameValid() {
        return this.ownUser.name.length > 0 && this.ownUser.name.length < 24;
    }

    private get panes() {
        return [{ menuItem: "Join" }, { menuItem: "Host" }];
    }

    public render() {
        return (
            <MenuContainer>
                <Segment>
                    <h1>Connect</h1>
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
            </MenuContainer>
        );
    }
}

export const routeMainMenu: Route<{}> = addRoute({
    path: () => "/main-menu",
    pattern: "/main-menu",
    component: PageMainMenu,
});
