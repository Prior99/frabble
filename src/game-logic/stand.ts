import { observable, action, computed } from "mobx";
import { Letter } from "../types";
import { insert } from "ramda";

export class Stand {
    public static readonly MAX_LETTERS = 7;
    public static readonly EMPTY = 3;

    @observable public letters = new Map<number, Letter | undefined>();

    constructor(letters: Letter[]) {
        this.add(...letters);
    }

    @computed private get count(): number {
        return Array.from(this.letters.values()).filter(value => value !== undefined).length;
    }

    @computed public get missingLetterCount() {
        return Stand.MAX_LETTERS - this.count;
    }

    @action.bound public add(...letters: Letter[]) {
        for (const letter of letters) {
            for (let index = 0; ; ++index) {
                if (this.at(index) === undefined) {
                    this.set(index, letter);
                    break;
                }
            }
        }
    }

    @action.bound public set(index: number, letter: Letter) {
        this.letters.set(index, letter);
    }

    @action.bound public remove(...indices: number[]): Letter[] {
        const removedLetters = indices.map((index) => this.at(index)).filter(value => value !== undefined);
        for (const index of indices) {
            this.letters.set(index, undefined);
        }
        return removedLetters as Letter[];
    }

    public at(index: number): Letter | undefined {
        return this.letters.get(index);
    }

    @computed public get maxIndex(): number {
        return Math.max(...Array.from(this.letters.keys()), Stand.MAX_LETTERS, Stand.EMPTY);
    }
}