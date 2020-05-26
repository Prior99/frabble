import * as React from "react";
import { History } from "history";
import { Route, addRoute, RouteProps } from "../../routing";
import { external, inject } from "tsdi";
import { Segment } from "semantic-ui-react";
import { observer } from "mobx-react";
import { bind } from "bind-decorator";
import "./page-main-menu.scss";
import { MenuContainer } from "../../ui";
import { Game } from "../../game";
import { ConnectMenu } from "p2p-networking-semantic-ui-react";
import { NetworkMode } from "p2p-networking";
import { routeGame } from "../page-game";
import { LobbyMode } from "../../types";

declare const SOFTWARE_VERSION: string;

@external
@observer
export class PageMainMenu extends React.Component<RouteProps<{}>> {
    @inject private game!: Game;
    @inject("history") private history!: History;

    @bind private handleSubmit(networkMode: NetworkMode, peerId?: string): void {
        if (networkMode === NetworkMode.CLIENT) {
            this.history.push(routeGame.path(LobbyMode.CLIENT, peerId));
        } else {
            this.history.push(routeGame.path(LobbyMode.HOST));
        }
    }

    public render(): JSX.Element {
        return (
            <MenuContainer className="PageMainMenu">
                <div className="PageMainMenu__header">
                    <div className="PageMainMenu__logo" />
                    <h1 className="PageMainMenu__name">Frabble</h1>
                </div>
                <Segment className="PageMainMenu__segment">
                    <ConnectMenu onSubmit={this.handleSubmit} />
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
