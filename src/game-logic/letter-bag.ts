import { create as randomSeed, RandomSeed } from "random-seed";
import { Letter } from "../types";
import { shuffle } from "../utils";
import { action, computed, observable } from "mobx";
import { getLetterOccurence, allLetters } from "./letters";

export class LetterBag {
    @observable private letters: Letter[] = [];
    private rng?: RandomSeed;

    public initialize(seed: string): void {
        this.rng = randomSeed(seed);
        this.refill();
    }

    public refill(): void {
        for (const letter of allLetters()) {
            for (let i = 0; i < getLetterOccurence(letter); ++i) {
                this.letters.push(letter);
            }
        }
        this.shuffle();
    }

    @action.bound private shuffle(): void {
        const { rng } = this;
        if (!rng) {
            throw new Error("Letter bag was not initialized.");
        }
        this.letters = shuffle(this.letters, () => rng.floatBetween(0, 1));
    }

    @action.bound public take(): Letter {
        const letter = this.letters.pop();
        if (letter === undefined) {
            throw new Error("Letter bag was empty but letter was taken.");
        }
        return letter;
    }

    @computed public get count(): number {
        return this.letters.length;
    }

    @action.bound public putBack(...letters: Letter[]): void {
        this.letters.push(...letters);
        this.shuffle();
    }

    @action.bound public takeMany(count: number): Letter[] {
        const result: Letter[] = [];
        for (let i = 0; i < count && this.count > 0; ++i) {
            result.push(this.take());
        }
        return result;
    }

    @action.bound public exchange(...letters: Letter[]): Letter[] {
        this.putBack(...letters);
        return this.takeMany(letters.length);
    }

    @computed public get isEmpty(): boolean {
        return this.count === 0;
    }
}