import { RemoteUser } from "./remote-user";
import { Letter } from "../types";

export enum ClientMessageType {
    HELLO = "hello",
    LETTER_PLACE = "letter place",
    LETTER_REMOVE = "letter remove",
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

export interface ClientMessageLetterPlace {
    message: ClientMessageType.LETTER_PLACE;
    sourceLetterIndex: number;
    position: [number, number];
}

export interface ClientMessageLetterRemove {
    message: ClientMessageType.LETTER_REMOVE;
    position: [number, number];
    targetLetterIndex?: number;
}

export interface ClientMessageEndTurn {
    message: ClientMessageType.END_TURN;
}

export type ClientMessage =
    | ClientMessageHello
    | ClientMessageEndTurn
    | ClientMessageLetterPlace
    | ClientMessageLetterRemove
    | ClientMessagePass;