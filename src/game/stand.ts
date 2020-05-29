import { observable, action, computed } from "mobx";
import { Letter } from "../types";
import { getPointsForLetter } from "./letters";

export class Stand {
    public static readonly MAX_LETTERS = 7;
    public static readonly EMPTY = 3;

    @observable public letters = new Map<number, Letter | undefined>();

    constructor(letters: Map<number, Letter | undefined> | Letter[]) {
        if (Array.isArray(letters)) {
            this.add(...letters);
        } else {
            this.letters = letters;
        }
    }

    @computed private get count(): number {
        return Array.from(this.letters.values()).filter((value) => value !== undefined).length;
    }

    @computed public get missingLetterCount(): number {
        return Stand.MAX_LETTERS - this.count;
    }

    @action.bound public add(...letters: Letter[]): void {
        for (const letter of letters) {
            for (let index = 0; ; ++index) {
                if (this.at(index) === undefined) {
                    this.set(index, letter);
                    break;
                }
            }
        }
    }

    @action.bound public set(index: number, letter: Letter): void {
        this.letters.set(index, letter);
    }

    @action.bound public remove(...indices: number[]): Letter[] {
        const removedLetters = indices.map((index) => this.at(index)).filter((value) => value !== undefined);
        for (const index of indices) {
            this.letters.set(index, undefined);
        }
        return removedLetters as Letter[];
    }

    public at(index: number): Letter | undefined {
        return this.letters.get(index);
    }

    public nextFreePosition(min = 0): number {
        for (;this.letters.get(min) !== undefined; ++min) {
            continue;
        }
        return min;
    }

    @computed public get maxIndex(): number {
        return Math.max(...Array.from(this.letters.keys()), Stand.MAX_LETTERS + Stand.EMPTY);
    }

    @computed public get isEmpty(): boolean {
        return this.count === 0;
    }

    @computed public get summedLetterScore(): number {
        return Array.from(this.letters.values()).reduce(
            (sum, letter) => (letter === undefined ? sum : sum + getPointsForLetter(letter)),
            0,
        );
    }
}
