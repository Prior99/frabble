import { RemoteUser } from "./remote-user";
import { Letter } from "../types";

export enum ClientMessageType {
    HELLO = "hello",
    PLACE_LETTER = "place letter",
}

export interface BaseClientMessage {
    originPeerId: string;
}

export interface ClientMessageHello extends BaseClientMessage {
    message: ClientMessageType.HELLO;
    user: RemoteUser;
}

export interface ClientMessageGameStateChange extends BaseClientMessage  {
    message: ClientMessageType.PLACE_LETTER;
    letter: Letter;
    position: [number, number];
}

export type ClientMessage =
    | ClientMessageHello
    | ClientMessageGameStateChange;