import PeerJS from "peerjs";
import { bind } from "bind-decorator";
import { v4 } from "uuid";
import { EventEmitter } from "typed-event-emitter";
import {
    RemoteUser,
    HostMessage,
    HostMessageType,
    ClientMessageType,
    ClientMessage,
} from "../types";
import { observable } from "mobx";

export abstract class Peer extends EventEmitter {
    protected peer?: PeerJS;
    @observable public peerId = v4();
    @observable public networkId: string | undefined = undefined;

    public onWelcome = this.registerEvent<(users: RemoteUser[]) => void>();
    public onUserConnected = this.registerEvent<(user: RemoteUser) => void>();
    public onUserDisconnected = this.registerEvent<(userId: string) => void>();
    public onGameStart = this.registerEvent<() => void>();

    protected abstract sendClientMessage(message: ClientMessage): void;

    @bind protected handleHostMessage(message: HostMessage) {
        console.info(`Received host message:`, message);
        switch (message.message) {
            case HostMessageType.WELCOME:
                return this.emit(this.onWelcome, message.users);
            case HostMessageType.USER_CONNECTED:
                return this.emit(this.onUserConnected, message.user);
            case HostMessageType.USER_DISCONNECTED:
                return this.emit(this.onUserDisconnected, message.userId);
            case HostMessageType.GAME_START:
                return this.emit(this.onGameStart);
        }
    }

    @bind public async close(): Promise<void> {
        if (!this.peer) {
            return;
        }
        this.peer.destroy();
    }

    @bind protected async open(): Promise<string> {
        await new Promise(resolve => {
            this.peer = new PeerJS(null as any); // eslint-disable-line
            this.peer.on("open", () => resolve());
        });
        if (!this.peer) {
            throw new Error("Connection id could not be determined.");
        }
        console.info(`Connection open. Peer id is ${this.peer.id}.`)
        return this.peer.id;
    }

    @bind protected sendToPeer(connection: PeerJS.DataConnection, message: HostMessage | ClientMessage): void {
        connection.send(message);
    }

    @bind public sendHello(user: RemoteUser): void {
        this.sendClientMessage({
            message: ClientMessageType.HELLO,
            user,
            originPeerId: this.peerId,
        });
    }
}
