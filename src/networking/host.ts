import { external } from "tsdi";
import PeerJS from "peerjs";
import { Peer } from "./peer";
import { bind } from "bind-decorator";
import {
    ClientMessage,
    ClientMessageType,
    RemoteUser,
    HostMessageType,
    HostMessage,
    GameConfig,
    BaseClientMessage,
} from "../types";
import { RemoteUsers } from "../game";

@external
export class Host extends Peer {
    private connections = new Map<string, PeerJS.DataConnection>();

    @bind private broadcastMessage(message: HostMessage): void {
        for (const connection of this.connections.values()) {
            this.sendToPeer(connection, message);
        }
        this.handleHostMessage(message);
    }

    @bind protected handleClientMessage(userId: string, message: ClientMessage & BaseClientMessage): void {
        console.info(`Received client message from ${userId}:`, message);
        switch (message.message) {
            case ClientMessageType.END_TURN:
            case ClientMessageType.CELL_MOVE:
            case ClientMessageType.PASS:
                this.broadcastMessage({
                    message: HostMessageType.RELAYED_CLIENT_MESSAGE,
                    clientMessage: message,
                })
                return;
            default:
                throw new Error(`Received unexpected message from client with type: ${message.message}`);
        }
    }

    @bind protected sendClientMessage(message: ClientMessage): void {
        this.handleClientMessage(this.remoteUsers.ownUser.id, { ...message, originPeerId: this.peerId, originUserId: this.remoteUsers.ownUser.id });
    }

    @bind public async host(): Promise<void> {
        const networkId = await super.open();
        if (!this.peer) {
            throw new Error("PeerJS failed to initialize.");
        }
        this.peer.on("connection", connection => this.handleConnect(connection));
        this.networkId = networkId;
    }

    @bind private handleConnect(connection: PeerJS.DataConnection): void {
        let userId: string;
        connection.on("data", json => {
            const message: ClientMessage & BaseClientMessage = json;
            switch (message.message) {
                case ClientMessageType.HELLO:
                    userId = message.user.id;
                    this.sendToPeer(connection, {
                        message: HostMessageType.WELCOME,
                        users: this.remoteUsers.all,
                    });
                    this.connections.set(userId, connection);
                    console.info(`Client connected and was greeted: ${message.user.id} (${message.user.id})`);
                    this.broadcastMessage({
                        message: HostMessageType.USER_CONNECTED,
                        user: message.user,
                    });
                    return;
                default:
                    this.handleClientMessage(userId, message);
                    return;
            }
        });
    }

    @bind protected sendToUser(userId: string, message: HostMessage): void {
        if (userId === this.remoteUsers.ownUser.id) {
            this.handleHostMessage(message);
            return;
        }
        const connection = this.connections.get(userId);
        if (!connection) {
            throw new Error(`Unknown user id "${userId}".`);
        }
        this.sendToPeer(connection, message);
    }

    @bind public sendWelcome(users: RemoteUser[]): void {
        this.broadcastMessage({
            message: HostMessageType.WELCOME,
            users,
        });
    }

    @bind public sendUserConnected(user: RemoteUser): void {
        this.broadcastMessage({
            message: HostMessageType.USER_CONNECTED,
            user,
        });
    }

    @bind public sendUserDisconnected(userId: string): void {
        this.broadcastMessage({
            message: HostMessageType.USER_DISCONNECTED,
            userId,
        });
    }

    @bind public sendGameStart(config: GameConfig): void {
        this.broadcastMessage({
            message: HostMessageType.GAME_START,
            config,
        });
    }

    @bind public sendRestart(): void {
        this.broadcastMessage({
            message: HostMessageType.RESTART,
        });
    }
}

export async function createHost(users: RemoteUsers): Promise<Host> {
    const host = new Host(users);
    await host.host();
    return host;
}
