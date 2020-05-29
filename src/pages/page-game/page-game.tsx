import * as React from "react";
import { addRoute, RouteProps } from "../../routing";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { LobbyMode, GameState } from "../../types";
import "./page-game.scss";
import { Game } from "../../game";
import { Lobby, GameContainer, DisconnectedModal } from "../../ui";
import { invariant } from "../../utils";
import { ReconnectModal, ConnectLoader } from "p2p-networking-semantic-ui-react";
import { computed } from "mobx";

export interface PageGameProps {
    lobbyMode: LobbyMode;
    peerId?: string;
    userId?: string;
}

@external
@observer
export class PageGame extends React.Component<RouteProps<PageGameProps>> {
    @inject private game!: Game;

    async componentDidMount(): Promise<void> {
        const { lobbyMode, peerId, userId } = this.props.match.params;
        if (lobbyMode === LobbyMode.HOST) {
            await this.game.initialize();
        } else {
            if (userId) {
                await this.game.initialize(peerId!, userId!);
            } else {
                await this.game.initialize(peerId!);
            }
        }
    }

    @computed private get content(): JSX.Element {
        switch (this.game.state) {
            case GameState.LOBBY:
                return <Lobby className="PageGame__lobby" />;
            case GameState.STARTED:
                return <GameContainer className="PageGame__gameContainer" />;
            default:
                invariant(this.game.state);
        }
    }

    public render(): JSX.Element {
        return (
            <div className="PageGame">
                <DisconnectedModal />
                <ReconnectModal peer={this.game.peer} />
                <ConnectLoader peer={this.game.peer} />
                {this.content}
            </div>
        );
    }
}

export const routeGame = addRoute<PageGameProps>({
    path: (lobbyMode: LobbyMode, peerId?: string, userId?: string) => {
        switch (lobbyMode) {
            case LobbyMode.CLIENT:
                if (userId) {
                    return `/game/client/${peerId}/userId`;
                }
                return `/game/client/${peerId}`;
            case LobbyMode.HOST:
                return `/game/host`;
        }
    },
    pattern: "/game/:lobbyMode/:peerId?/:userId?",
    component: PageGame,
});
