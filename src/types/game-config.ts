export const enum Dictionary {
    GERMAN = "german",
}

export interface GameConfig {
    dictionary: Dictionary;
    timeLimit?: number;
}
