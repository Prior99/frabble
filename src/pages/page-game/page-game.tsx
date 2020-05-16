import * as React from "react";
import { addRoute, RouteProps } from "../../routing";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { LobbyMode } from "../../types";
import { UiBoard } from "../../ui/ui-board";
import "./page-game.scss";

export interface PageGameProps {
    lobbyMode: LobbyMode;
    id?: string;
}

@external
@observer
export class PageGame extends React.Component<RouteProps<PageGameProps>> {
    public render() {
        return (
            <UiBoard className="PageGame__board" />
        );
    }
}

export const routeGame = addRoute<PageGameProps>({
    path: (lobbyMode: LobbyMode, id?: string) => {
        switch (lobbyMode) {
            case LobbyMode.CLIENT:
                return `/game/client/${id}`;
            case LobbyMode.HOST:
                return `/game/host`;
        }
    },
    pattern: "/game/:lobbyMode/:id?",
    component: PageGame,
});
