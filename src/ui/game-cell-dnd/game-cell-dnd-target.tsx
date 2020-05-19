import { Letter, DndDraggable, CellMoveInfo, CellPosition } from "../../types";
import { BaseGameCellProps, GameCell } from "../game-cell";
import { DropResult, DragItem, GameCellDndMode, GameCellDragResultType } from "./game-cell-dnd-types";
import { useDrop } from "react-dnd";
import React from "react";
import { omit } from "ramda";

export interface DropInfo extends CellMoveInfo{
    letter: Letter;
}

export interface GameCellDndTargetProps extends BaseGameCellProps {
    dragMode: GameCellDndMode.TARGET;
    onDrop: (info: DropInfo) => boolean;
    position: CellPosition;
}

export function GameCellDndTarget({
    onDrop,
    position: targetPosition,
    ...gameCellProps
}: GameCellDndTargetProps): JSX.Element {
    const [{ hovered }, dropRef] = useDrop<DragItem, DropResult, { hovered: boolean}>({
        accept: DndDraggable.LETTER,
        drop: ({ letter, sourcePosition }) => {
            const success = onDrop({
                targetPosition,
                letter,
                sourcePosition,
            });
            if (success) {
                return {
                    dragResultType: GameCellDragResultType.SUCCESS,
                    targetPosition,
                };
            }
            return {
                dragResultType: GameCellDragResultType.ABORT,
            };
        },
        collect: monitor => ({
            hovered: monitor.isOver()
        })
    });

    return <GameCell {...omit(["dragMode"], gameCellProps)} hovered={hovered} innerRef={dropRef} />;
}
