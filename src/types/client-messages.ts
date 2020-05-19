import { RemoteUser } from "./remote-user";
import { SerializedCellPosition } from "../utils";

export enum ClientMessageType {
    HELLO = "hello",
    CELL_MOVE = "cell move",
    PASS = "pass",
    END_TURN = "end turn",
}

export interface BaseClientMessage {
    originPeerId: string;
    originUserId: string;
}

export interface ClientMessageHello {
    message: ClientMessageType.HELLO;
    user: RemoteUser;
}

export interface ClientMessagePass {
    message: ClientMessageType.PASS;
    exchangedLetters: SerializedCellPosition[];
}

export interface ClientMessageCellMove {
    message: ClientMessageType.CELL_MOVE;
    sourcePosition: SerializedCellPosition;
    targetPosition: SerializedCellPosition;
}

export interface ClientMessageEndTurn {
    message: ClientMessageType.END_TURN;
}

export type ClientMessage =
    | ClientMessageHello
    | ClientMessageEndTurn
    | ClientMessageCellMove
    | ClientMessagePass;