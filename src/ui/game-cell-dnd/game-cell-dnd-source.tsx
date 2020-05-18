import { useDrag } from "react-dnd";
import {
    DragItem,
    DropResult,
    GameCellDragResultType,
    GameCellDragResult,
    GameCellDndMode,
} from "./game-cell-dnd-types";
import { DndDraggable, Letter, CellPosition } from "../../types";
import { invariant } from "../../utils";
import React from "react";
import { BaseGameCellProps, GameCell } from "../game-cell";

export interface DragStartInfo {
    sourcePosition: CellPosition;
    letter: Letter;
}

export interface GameCellDndSourceProps extends BaseGameCellProps {
    dragMode: GameCellDndMode.SOURCE;
    letter: Letter;
    onDragStop: (result: GameCellDragResult) => void;
    onDragStart: (info: DragStartInfo) => void;
    position: CellPosition;
}

export function GameCellDndSource({
    dragMode,
    onDragStart,
    onDragStop,
    position: sourcePosition,
    ...gameCellProps
}: GameCellDndSourceProps): JSX.Element {
    const { letter } = gameCellProps;
    const [_, dragRef] = useDrag<DragItem, DropResult, {}>({
        item: {
            type: DndDraggable.LETTER,
            letter,
            sourcePosition,
        },
        begin: () => onDragStart({ letter, sourcePosition }),
        end: (_, monitor) => {
            const result: DropResult = monitor.getDropResult();
            if (!result || result.dragResultType === GameCellDragResultType.ABORT) {
                return onDragStop({
                    dragResultType: GameCellDragResultType.ABORT,
                    sourcePosition,
                    letter,
                });
            }
            return onDragStop({
                dragResultType: GameCellDragResultType.SUCCESS,
                sourcePosition,
                targetPosition: result.targetPosition,
                letter,
            });
        },
    });

    return <GameCell innerRef={dragRef} {...gameCellProps} />;
}
