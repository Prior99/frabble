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
    GameConfig,
    Letter,
    BaseClientMessage,
} from "../types";
import { observable } from "mobx";
import { invariant } from "mobx/lib/internal";
import { Vec2, vec2 } from "../utils";
import { RemoteUsers } from "../game";

export abstract class Peer extends EventEmitter {
    protected peer?: PeerJS;
    @observable public peerId = v4();
    @observable public networkId: string | undefined = undefined;


    constructor(protected remoteUsers: RemoteUsers) {
        super();
    }

    public onWelcome = this.registerEvent<(users: RemoteUser[]) => void>();
    public onUserConnected = this.registerEvent<(user: RemoteUser) => void>();
    public onUserDisconnected = this.registerEvent<(userId: string) => void>();
    public onGameStart = this.registerEvent<(config: GameConfig) => void>();
    public onLetterRemove = this.registerEvent<(position: Vec2) => void>();
    public onLetterPlace = this.registerEvent<(position: Vec2, letter: Letter) => void>();
    public onPass = this.registerEvent<(letters: Letter[]) => void>();
    public onEndTurn = this.registerEvent<() => void>();

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
                return this.emit(this.onGameStart, message.config);
            case HostMessageType.RELAYED_CLIENT_MESSAGE:
                const { clientMessage } = message;
                switch (clientMessage.message) {
                    case ClientMessageType.LETTER_PLACE:
                        return this.emit(this.onLetterPlace, vec2(...clientMessage.position), clientMessage.letter);
                    case ClientMessageType.LETTER_REMOVE:
                        return this.emit(this.onLetterRemove, vec2(...clientMessage.position));
                    case ClientMessageType.PASS:
                        return this.emit(this.onPass, clientMessage.letters);
                    case ClientMessageType.END_TURN:
                        return this.emit(this.onEndTurn);
                    default: invariant(clientMessage.message);
                }
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

    @bind protected sendToPeer(connection: PeerJS.DataConnection, message: HostMessage | (ClientMessage & BaseClientMessage)): void {
        connection.send(message);
    }

    @bind public sendHello(user: RemoteUser): void {
        this.sendClientMessage({
            message: ClientMessageType.HELLO,
            user,
        });
    }

    @bind public sendLetterPlace(position: Vec2, letter: Letter): void {
        this.sendClientMessage({
            message: ClientMessageType.LETTER_PLACE,
            position: [position.x, position.y],
            letter,
        });
    }

    @bind public sendLetterRemove(position: Vec2): void {
        this.sendClientMessage({
            message: ClientMessageType.LETTER_REMOVE,
            position: [position.x, position.y],
        });
    }

    @bind public sendPass(letters: Letter[]): void {
        this.sendClientMessage({
            message: ClientMessageType.PASS,
            letters,
        });
    }

    @bind public sendEndTurn(): void {
        this.sendClientMessage({
            message: ClientMessageType.END_TURN,
        });
    }
}
