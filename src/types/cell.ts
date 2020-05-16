import { Letter } from "./letter";

export type Cell = {
    empty: true;
} | {
    empty: false;
    playerId: string;
    letter: Letter;
    turn: number;
}