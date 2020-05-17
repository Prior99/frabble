import * as React from "react";
import { Cell, CellMode, DndDraggable } from "../../types";
import { observer } from "mobx-react";
import classnames from "classnames";
import { computed } from "mobx";
import "./ui-cell.scss";
import { getPointsForLetter } from "../../game-logic/letters";
import { DragSource, DropTarget, useDrag, useDrop, DragObjectWithType } from "react-dnd";
import { invariant, Vec2 } from "../../utils";

export const enum UiCellDragMode {
    SOURCE = "source",
    TARGET = "target",
    NONE = "none",
}
export interface UiCellProps {
    cell: Cell;
    mode: CellMode;
    className?: string;
}

@observer
export class BaseUiCell extends React.Component<UiCellProps & { innerRef?: React.LegacyRef<HTMLDivElement> }> {
    @computed private get classNames(): string {
        const { cell, mode } = this.props;
        return classnames(
            {
                Cell: true,
                "Cell--empty": cell.empty,
                "Cell--content": !cell.empty,
            },
            `Cell--${mode}`,
            this.props.className,
        );
    }

    @computed private get letter(): string {
        const { cell } = this.props;
        if (cell.empty) {
            return "";
        }
        return cell.letter.toUpperCase();
    }

    @computed private get points(): number {
        const { cell } = this.props;
        if (cell.empty) {
            return 0;
        }
        return getPointsForLetter(cell.letter);
    }

    public render(): JSX.Element {
        return (
            <div ref={this.props.innerRef} className={this.classNames}>
                <div className="Cell__points">{this.points}</div>
                <div className="Cell__letter">{this.letter}</div>
            </div>
        );
    }
}

interface BaseDragModeProps {
    dragMode: UiCellDragMode.NONE;
}

interface SourceModeProps {
    dragMode: UiCellDragMode.SOURCE;
    onDrop: (index: number) => void;
    index: number;
}
interface TargetModeProps {
    dragMode: UiCellDragMode.TARGET;
    onDrop: (position: Vec2, cell: Cell) => boolean;
    position: Vec2;
}

export type UiCellDragModeProps = BaseDragModeProps | TargetModeProps | SourceModeProps;

interface DragInfo extends DragObjectWithType {
    cell: Cell;
}

export function UiCell(props: UiCellProps & UiCellDragModeProps) {
    const { dragMode, ...other } = props;
    switch (props.dragMode) {
        case UiCellDragMode.NONE:
            return <BaseUiCell {...other} />;
        case UiCellDragMode.SOURCE: {
            const [_, dragRef] = useDrag<DragInfo, { success: boolean }, {}>({
                item: { type: DndDraggable.LETTER, cell: props.cell },
                end: (_, monitor) => monitor.getDropResult().success && props.onDrop(props.index),
            });

            return <BaseUiCell innerRef={dragRef} {...other} />;
        }
        case UiCellDragMode.TARGET: {
            const [_, dropRef] = useDrop<DragInfo, { success: boolean }, {}>({
                accept: DndDraggable.LETTER,
                drop: (info) => ({ success: props.onDrop(props.position, info.cell) }),
                canDrop: () => true,
            });

            return <BaseUiCell {...other} innerRef={dropRef} />;
        }
        default:
            invariant(props);
    }
}
