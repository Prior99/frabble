import { create as randomSeed, RandomSeed } from "random-seed";
import { allLetters, getLetterOccurence } from "./letters";
import { Letter } from "../types";
import { shuffle } from "../utils";

export class LetterBag {
    private letters: Letter[] = [];
    private rng: RandomSeed;

    constructor(seed: string) {
        this.rng = randomSeed(seed);
        for (const letter of allLetters()) {
            for (let i = 0; i < getLetterOccurence(letter); ++i) {
                this.letters.push(letter);
            }
        }
        this.shuffle();
    }

    private shuffle() {
        this.letters = shuffle(this.letters, () => this.rng.floatBetween(0, 1));
    }

    public take(): Letter {
        const letter = this.letters.pop();
        if (letter === undefined) {
            throw new Error("Letter bag was empty but letter was taken.");
        }
        return letter;
    }

    public get count() {
        return this.letters.length;
    }

    public putBack(...letters: Letter[]): void {
        this.letters.push(...letters);
        this.shuffle();
    }

    public takeMany(count: number): Letter[] {
        const result: Letter[] = [];
        for (let i = 0; i < count && this.count > 0; ++i) {
            result.push(this.take());
        }
        return result;
    }

    public exchange(...letters: Letter[]): Letter[] {
        this.putBack(...letters);
        return this.takeMany(letters.length);
    }
}