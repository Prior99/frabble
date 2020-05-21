import { RemoteUser } from "./remote-user";
import { GameConfig } from "./game-config";
import { ClientMessage } from "./client-messages";

export enum HostMessageType {
    WELCOME = "welcome",
    USER_CONNECTED = "user connected",
    USER_DISCONNECTED = "user disconnected",
    GAME_START = "game start",
    RELAYED_CLIENT_MESSAGE = "relayed client message",
    RESTART = "restart",
    CHANGE_NAME = "change name",
}

export interface HostMessageWelcome {
    message: HostMessageType.WELCOME;
    users: RemoteUser[];
}

export interface HostMessageUserConnected {
    message: HostMessageType.USER_CONNECTED;
    user: RemoteUser;
}

export interface HostMessageUserDisconnected {
    message: HostMessageType.USER_DISCONNECTED;
    userId: string;
}

export interface HostMessageGameStart {
    message: HostMessageType.GAME_START;
    config: GameConfig;
}

export interface HostMessageRelayedClientMessage {
    message: HostMessageType.RELAYED_CLIENT_MESSAGE;
    clientMessage: ClientMessage;
}

export interface HostMessageRestart {
    message: HostMessageType.RESTART;
}

export interface HostMessageChangeName {
    message: HostMessageType.CHANGE_NAME;
    name: string;
    userId: string;
}

export type HostMessage =
    | HostMessageWelcome
    | HostMessageUserConnected
    | HostMessageUserDisconnected
    | HostMessageGameStart
    | HostMessageRelayedClientMessage
    | HostMessageRestart
    | HostMessageChangeName;