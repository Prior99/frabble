import { Cell, CellMode, Letter } from "../types";
import { Vec2, vec2 ,rect, RectIteratorOrder } from "../utils";
import { observable, action } from "mobx";
import { stringifyKey } from "mobx/lib/internal";

export type BoardIterator = Generator<{
    cell: Cell;
    position: Vec2;
    mode: CellMode;
}>;

export class Board {
    @observable private cells: Cell[] = new Array(15 * 15).fill({ empty: true });
    private readonly rect = rect(-7, -7, 15, 15);

    constructor() {
        this.cells[17] = {
            empty: false,
            playerId: "",
            letter: Letter.D,
            turn: 3,
        };
        this.cells[18] = {
            empty: false,
            playerId: "",
            letter: Letter.AE,
            turn: 3,
        };
        this.cells[19] = {
            empty: false,
            playerId: "",
            letter: Letter.Q,
            turn: 3,
        };
        this.cells[20] = {
            empty: false,
            playerId: "",
            letter: Letter.I,
            turn: 3,
        };
    }

    @action.bound public initialize() {
        this.cells = this.cells.fill({ empty: true });
    }

    @action.bound public letterPlace(pos: Vec2, letter: Letter, playerId: string, turn: number): void {
        this.cells[this.rect.toIndex(pos)] = {
            empty: false,
            playerId,
            turn,
            letter,
        };
    }

    @action.bound public letterRemove(pos: Vec2): Cell {
        const cell = this.at(pos);
        this.cells[this.rect.toIndex(pos)] = {
            empty: true,
        };
        return cell;
    }

    public at(pos: Vec2): Cell {
        return this.cells[this.rect.toIndex(pos)];
    }

    public isEmpty(pos: Vec2): boolean {
        return this.at(pos).empty;
    }

    public positionIterator(iteratorOrder: RectIteratorOrder = RectIteratorOrder.RIGHT_DOWN): Generator<Vec2> {
        return this.rect.positionIterator(iteratorOrder);
    }

    public *iterator(iteratorOrder: RectIteratorOrder = RectIteratorOrder.RIGHT_DOWN): BoardIterator {
        for (const position of this.positionIterator(iteratorOrder)) {
            yield {
                position,
                mode: this.cellModeAt(position),
                cell: this.at(position),
            };
        }
    }

    public cellModeAt(pos: Vec2): CellMode {
        const { abs } = pos;
        if (abs.equals(0, 0)) {
            return CellMode.ROOT;
        }
        if (abs.equals(7, 7) || abs.equals(7, 0) || abs.equals(0, 7)) {
            return CellMode.WORD_TRIPLE;
        }
        if (abs.x === abs.y && abs.x == 1) {
            return CellMode.LETTER_DOUBLE;
        }
        if (abs.x === abs.y && abs.x == 2) {
            return CellMode.LETTER_TRIPLE;
        }
        if (abs.x === abs.y && abs.x >= 3) {
            return CellMode.WORD_DOUBLE;
        }
        if (abs.equals(7, 4) || abs.equals(4, 7)) {
            return CellMode.LETTER_DOUBLE;
        }
        if (abs.equals(6, 2) || abs.equals(2, 6)) {
            return CellMode.LETTER_TRIPLE;
        }
        if (abs.equals(5, 1) || abs.equals(1, 5)) {
            return CellMode.LETTER_DOUBLE;
        }
        if (abs.equals(0, 4) || abs.equals(4, 0)) {
            return CellMode.LETTER_DOUBLE;
        }
        return CellMode.STANDARD;
    }
}