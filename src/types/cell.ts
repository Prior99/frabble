import { Letter } from "./letter";
import { Vec2 } from "../utils";

export type Cell = {
    empty: true;
} | {
    empty: false;
    playerId: string;
    letter: Letter;
    turn: number;
}

export const enum CellPositionType {
    STAND = "stand",
    BOARD = "board",
}

export interface CellPositionStand {
    positionType: CellPositionType.STAND;
    index: number;
    playerId: string;
}

export interface CellPositionBoard {
    positionType: CellPositionType.BOARD;
    position: Vec2;
}

export type CellPosition = CellPositionBoard | CellPositionStand;

export interface CellMoveInfo {
    targetPosition: CellPosition;
    sourcePosition: CellPosition;
}