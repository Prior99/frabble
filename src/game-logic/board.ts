import { Cell, CellMode, Letter, CellFilled } from "../types";
import { Vec2, vec2, rect, RectIteratorOrder } from "../utils";
import { observable, action, computed } from "mobx";
import { uniq, symmetricDifferenceWith } from "ramda";
import { getPointsForLetter } from "./letters";
import { Stand } from "./stand";

export type ValidityResult =
    | {
          valid: true;
      }
    | {
          valid: false;
          reason: string;
      };

export type BoardIterator = Generator<{
    cell: Cell;
    position: Vec2;
    mode: CellMode;
}>;

export interface PlacedLetter {
    cell: Cell;
    position: Vec2;
}

export interface Word {
    positions: Vec2[];
    multiplier: number;
}

export function wordsEqual(a: Word, b: Word) {
    return symmetricDifferenceWith((pos1, pos2) => pos1.equals(pos2), a.positions, b.positions).length === 0;
}

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

    public isEmptyAt(pos: Vec2): boolean {
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


    @computed public get isEmpty(): boolean {
        for (const cell of this.iterator()) {
            if (!cell.cell.empty) {
                return false;
            }
        }
        return true;
    }

    public wasEmptyBeforeTurn(turn: number): boolean {
        for (const cell of this.iterator()) {
            if (!cell.cell.empty && cell.cell.turn < turn) {
                return false;
            }
        }
        return true;
    }

    public getLettersForTurn(turn: number): PlacedLetter[] {
        const result: PlacedLetter[] = [];
        for (const position of this.positionIterator()) {
            const cell = this.at(position);
            if (cell.empty) {
                continue;
            }
            if (cell.turn === turn) {
                result.push({ cell, position });
            }
        }
        return result;
    }

    private getAdjacentFilledCells(position: Vec2): CellFilled[] {
        const result: Cell[] = [];
        if (position.x > -7) {
            result.push(this.at(position.sub(vec2(1, 0))));
        }
        if (position.x < 7) {
            result.push(this.at(position.add(vec2(1, 0))));
        }
        if (position.y > -7) {
            result.push(this.at(position.sub(vec2(0, 1))));
        }
        if (position.y < 7) {
            result.push(this.at(position.add(vec2(0, 1))));
        }
        return result.filter((cell: Cell): cell is CellFilled => !cell.empty);
    }

    public isTurnValid(turn: number): ValidityResult {
        const placedLetters = this.getLettersForTurn(turn);
        if (placedLetters.length === 0) {
            return { valid: false, reason: "You must place at least one letter." };
        }
        if (this.wasEmptyBeforeTurn(turn) && !placedLetters.some(({ position }) => position.equals(vec2(0, 0)))) {
            return { valid: false, reason: "The first word must be placed across the center of the board." };
        }

        const listX = uniq(placedLetters.map(({ position }) => position.x));
        const listY = uniq(placedLetters.map(({ position }) => position.y));
        if (listX.length !== 1 && listY.length !== 1) {
            return { valid: false, reason: "Not all letters are in a row / column." };
        }

        const placedIntoVoid = !placedLetters.some(({ position }) => {
            return this.getAdjacentFilledCells(position).some((cell) => cell.turn < turn);
        });
        if (!this.wasEmptyBeforeTurn(turn) && placedIntoVoid) {
            return { valid: false, reason: "Must place adjacent to existing word." };
        }

        const isRow = listY.length === 1;
        const relevantList = (isRow ? listX : listY).sort((a, b) => a - b);
        for (let item = relevantList[0]; item < relevantList[relevantList.length - 1]; ++item) {
            const position = isRow ? vec2(item, listY[0]) : vec2(listX[0], item);
            if (this.at(position).empty) {
                return { valid: false, reason: "All letters must form a single word." };
            }
        }

        return { valid: true };
    }

    private traverseWord(turn: number, position: Vec2, axis: Vec2): Word {
        const result: Word = { positions: [], multiplier: 1 };
        for (const direction of [axis, axis.mult(-1)]) {
            for (let iter = position; ; iter = iter.add(direction)) {
                if (!this.rect.contains(iter)) {
                    break;
                }
                if (result.positions.some(existingPosition => existingPosition.equals(iter))) {
                    continue;
                }
                const cell = this.at(iter);
                if (cell.empty) {
                    break;
                }
                result.positions.push(iter);
                if (cell.turn === turn) {
                    switch (this.cellModeAt(iter)) {
                        case CellMode.WORD_DOUBLE:
                            result.multiplier *= 2;
                            break;
                        case CellMode.WORD_TRIPLE:
                            result.multiplier *= 3;
                            break;
                    }
                }
            }
        }
        return result;
    }

    private getScoreAt(turn: number, position: Vec2): number {
        const cell = this.at(position);
        if (cell.empty) {
            return 0;
        }
        const rawPoints = getPointsForLetter(cell.letter);
        if (turn !== cell.turn) {
            return rawPoints;
        } else {
            switch (this.cellModeAt(position)) {
                case CellMode.LETTER_DOUBLE:
                    return rawPoints * 2;
                case CellMode.LETTER_TRIPLE:
                    return rawPoints * 3;
                default:
                    return rawPoints;
            }
        }
    }

    private getWordScore(turn: number, word: Word): number {
        const sumLetterPoints = word.positions
            .map((position) => this.getScoreAt(turn, position))
            .reduce((result, current) => result + current, 0);
        return sumLetterPoints * word.multiplier;
    }

    public getTurnScore(turn: number): number | undefined {
        const placedLetters = this.getLettersForTurn(turn);
        const words: Word[] = [];

        for (const currentPlaceLetter of placedLetters) {
            const newWords = [
                this.traverseWord(turn, currentPlaceLetter.position, vec2(1, 0)),
                this.traverseWord(turn, currentPlaceLetter.position, vec2(0, 1)),
            ];
            const filteredWords = newWords
                .filter((word) => word.positions.length > 1)
                .filter((newWord) => words.every((oldWord) => !wordsEqual(newWord, oldWord)));
            words.push(...filteredWords);
        }

        return words.map((word) => this.getWordScore(turn, word)).reduce((result, current) => result + current, 0);
    }
}
