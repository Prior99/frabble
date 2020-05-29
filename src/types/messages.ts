import { SerializedCellPosition } from "../utils";
import { GameConfig } from "./game-config";
import { GameState } from "./game-state";
import { Cell } from "./cell";
import { Letter } from "./letter";

export enum MessageType {
    CELL_MOVE = "cell move",
    PASS = "pass",
    END_TURN = "end turn",
    RESTART = "restart",
    GAME_START = "game start",
    GAME_STATE = "game state",
}

export interface MessageGameState {
    config: GameConfig;
    board: Cell[];
    letterBag: Letter[];
    turnOrder: string[];
    turn: number;
    scores: [string, number][],
    stands: [string, [number, Letter | undefined][]][];
    times: {
        deadline: number;
        now: number;
        fromTurn: number
    } | undefined;
    passedTurns: number[];
    state: GameState;
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