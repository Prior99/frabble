import { RemoteUser } from "./remote-user";
import { Letter } from "../types";
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
    exchangedLetterIndices: number[];
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