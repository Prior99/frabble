import { DndDraggable, Letter, CellPosition } from "../../types";
import { BaseGameCellProps } from "../game-cell";

export interface GameCellDndBasicProps extends BaseGameCellProps {
    dragMode: GameCellDndMode.NONE;
}

export interface DragItem {
    type: DndDraggable.LETTER;
    letter: Letter;
    sourcePosition: CellPosition;
}

export type DropResult =
    | {
          targetPosition: CellPosition;
          dragResultType: GameCellDragResultType.SUCCESS;
      }
    | {
          dragResultType: GameCellDragResultType.ABORT;
      };

export const enum GameCellDndMode {
    SOURCE = "source",
    TARGET = "target",
    NONE = "none",
}

export const enum GameCellDragResultType {
    SUCCESS = "success",
    ABORT = "abort",
}

export interface GameCellDragResultAbort {
    dragResultType: GameCellDragResultType.ABORT;
    sourcePosition: CellPosition;
    letter: Letter;
}

export interface GameCellDragResultSuccess {
    dragResultType: GameCellDragResultType.SUCCESS;
    sourcePosition: CellPosition;
    letter: Letter;
    targetPosition: CellPosition;
}

export type GameCellDragResult = GameCellDragResultSuccess | GameCellDragResultAbort;