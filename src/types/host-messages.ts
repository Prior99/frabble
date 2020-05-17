import { RemoteUser } from "./remote-user";
import { GameConfig } from "./game-config";

export enum HostMessageType {
    WELCOME = "welcome",
    USER_CONNECTED = "user connected",
    USER_DISCONNECTED = "user disconnected",
    GAME_START = "game start",
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


export type HostMessage =
    | HostMessageWelcome
    | HostMessageUserConnected
    | HostMessageUserDisconnected
    | HostMessageGameStart;