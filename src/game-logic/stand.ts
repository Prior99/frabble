import { observable, action, computed } from "mobx";
import { Letter } from "../types";
import { insert } from "ramda";

export class Stand {
    public static readonly MAX_LETTERS = 7;

    @observable public letters: Letter[] = [];

    constructor(letters: Letter[]) {
        this.letterAdd(...letters);
    }

    @computed public get missingLetterCount() {
        return Stand.MAX_LETTERS - this.letters.length;
    }

    @action.bound public letterAdd(...letters: Letter[]) {
        this.letters.push(...letters);
    }

    @action.bound public letterAddAt(index: number, letter: Letter) {
        this.letters = insert(index, letter, this.letters);
    }

    @action.bound public letterRemove(...indices: number[]): Letter[] {
        if (indices.length >= this.letters.length) {
            throw new Error(`There aren't enough letters on the stand to remove ${indices.length} letters`);
        }

        const removedLetters = indices.map((index) => this.letters[index]);
        this.letters = this.letters.filter((_, index) => !indices.includes(index));

        return removedLetters;
    }
}