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
    BaseClientMessage,
    CellMoveInfo,
    CellPosition,
    CellPositionStand,
} from "../types";
import { observable } from "mobx";
import { invariant, serializeCellPosition, deserializeCellPosition } from "../utils";
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
    public onCellMove = this.registerEvent<(sourcePosition: CellPosition, targetPosition: CellPosition) => void>();
    public onPass = this.registerEvent<(letterPositions: CellPositionStand[]) => void>();
    public onEndTurn = this.registerEvent<() => void>();
    public onRestart = this.registerEvent<() => void>();

    protected abstract sendClientMessage(message: ClientMessage): void;

    @bind protected handleHostMessage(message: HostMessage): void {
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
            case HostMessageType.RESTART:
                return this.emit(this.onRestart);
            case HostMessageType.RELAYED_CLIENT_MESSAGE: {
                const { clientMessage } = message;
                switch (clientMessage.message) {
                    case ClientMessageType.CELL_MOVE:
                        return this.emit(
                            this.onCellMove,
                            deserializeCellPosition(clientMessage.sourcePosition),
                            deserializeCellPosition(clientMessage.targetPosition),
                        );
                    case ClientMessageType.PASS:
                        return this.emit(this.onPass, clientMessage.exchangedLetters.map(deserializeCellPosition));
                    case ClientMessageType.END_TURN:
                        return this.emit(this.onEndTurn);
                    case ClientMessageType.HELLO:
                        throw new Error("Hello message must not be relayed.");
                    default:
                        invariant(clientMessage);
                }
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
        await new Promise((resolve) => {
            this.peer = new PeerJS(null as any); // eslint-disable-line
            this.peer.on("open", () => resolve());
        });
        if (!this.peer) {
            throw new Error("Connection id could not be determined.");
        }
        console.info(`Connection open. Peer id is ${this.peer.id}.`);
        return this.peer.id;
    }

    @bind protected sendToPeer(
        connection: PeerJS.DataConnection,
        message: HostMessage | (ClientMessage & BaseClientMessage),
    ): void {
        connection.send(message);
    }

    @bind public sendHello(user: RemoteUser): void {
        this.sendClientMessage({
            message: ClientMessageType.HELLO,
            user,
        });
    }

    @bind public sendCellMove(info: CellMoveInfo): void {
        this.sendClientMessage({
            message: ClientMessageType.CELL_MOVE,
            sourcePosition: serializeCellPosition(info.sourcePosition),
            targetPosition: serializeCellPosition(info.targetPosition),
        });
    }

    @bind public sendPass(exchangedLetters: CellPosition[]): void {
        this.sendClientMessage({
            message: ClientMessageType.PASS,
            exchangedLetters: exchangedLetters.map(serializeCellPosition),
        });
    }

    @bind public sendEndTurn(): void {
        this.sendClientMessage({
            message: ClientMessageType.END_TURN,
        });
    }
}
