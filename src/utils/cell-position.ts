import { CellPosition, CellPositionType, CellPositionStand, CellPositionBoard } from "../types";
import { invariant } from "./invariant";
import { vec2 } from "./vec2";

export type SerializedCellPosition = {
    positionType: CellPositionType.STAND;
    playerId: string;
    index: number;
} | {
    positionType: CellPositionType.BOARD;
    position: [number, number];
}

export function serializeCellPosition(position: CellPosition): SerializedCellPosition {
    switch (position.positionType) {
        case CellPositionType.BOARD:
            return {
                positionType: CellPositionType.BOARD,
                position: [position.position.x, position.position.y],
            };
        case CellPositionType.STAND:
            return {
                positionType: CellPositionType.STAND,
                index: position.index,
                playerId: position.playerId,
            };
        default: invariant(position);
    }
}

export function deserializeCellPosition(position: SerializedCellPosition): CellPosition {
    switch (position.positionType) {
        case CellPositionType.BOARD:
            return {
                positionType: CellPositionType.BOARD,
                position: vec2(...position.position),
            };
        case CellPositionType.STAND:
            return {
                positionType: CellPositionType.STAND,
                index: position.index,
                playerId: position.playerId,
            };
        default: invariant(position);
    }
}

export function cellPositionEquals(a: CellPosition, b: CellPosition): boolean {
    if (a.positionType !== b.positionType) {
        return false;
    }
    
    switch(a.positionType) {
        case CellPositionType.STAND:
            const bStand = b as CellPositionStand;
            return a.index === bStand.index && a.playerId === bStand.playerId;
        case CellPositionType.BOARD: 
            const bBoard = b as CellPositionBoard;
            return a.position.equals(bBoard.position);
        default: invariant(a);
    }
}