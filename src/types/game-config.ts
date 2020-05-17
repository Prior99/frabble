export const enum Language {
    GERMAN = "german",
    ENGLISH = "english",
}

export interface GameConfig {
    language: Language;
    timeLimit?: number;
    seed: string;
}
