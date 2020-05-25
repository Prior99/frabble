import { SerializedCellPosition } from "../utils";
import { GameConfig } from "./game-config";

export enum MessageType {
    CELL_MOVE = "cell move",
    PASS = "pass",
    END_TURN = "end turn",
    RESTART = "restart",
    GAME_START = "game start",
}

export interface MessageGameStart {
    config: GameConfig;
}

export interface MessageRestart {
}

export interface MessagePass {
    exchangedLetters: SerializedCellPosition[];
}

export interface MessageCellMove {
    sourcePosition: SerializedCellPosition;
    targetPosition: SerializedCellPosition;
}

export interface MessageEndTurn {
}