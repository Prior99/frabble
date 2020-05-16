import { Letter } from "../types";
import { invariant } from "../utils";

export function allLetters(): Letter[] {
    return [
        Letter.A,
        Letter.D,
        Letter.E,
        Letter.I,
        Letter.N,
        Letter.R,
        Letter.S,
        Letter.T,
        Letter.U,
        Letter.G,
        Letter.H,
        Letter.L,
        Letter.O,
        Letter.B,
        Letter.M,
        Letter.W,
        Letter.Z,
        Letter.C,
        Letter.F,
        Letter.K,
        Letter.P,
        Letter.AE,
        Letter.J,
        Letter.UE,
        Letter.V,
        Letter.OE,
        Letter.X,
        Letter.Q,
        Letter.Y,
    ];

}

export function getPointsForLetter(letter: Letter) {
    switch (letter) {
        case Letter.A:
        case Letter.D:
        case Letter.E:
        case Letter.I:
        case Letter.N:
        case Letter.R:
        case Letter.S:
        case Letter.T:
        case Letter.U:
            return 1;
        case Letter.G:
        case Letter.H:
        case Letter.L:
        case Letter.O:
            return 2;
        case Letter.B:
        case Letter.M:
        case Letter.W:
        case Letter.Z:
            return 3;
        case Letter.C:
        case Letter.F:
        case Letter.K:
        case Letter.P:
            return 4;
        case Letter.AE:
        case Letter.J:
        case Letter.UE:
        case Letter.V:
            return 6;
        case Letter.OE:
        case Letter.X:
            return 8;
        case Letter.Q:
        case Letter.Y:
            return 10;
        default:
            invariant(letter);
    }
}

export function getLetterOccurence(letter: Letter) {
    switch (letter) {
        case Letter.A: return 5;
        case Letter.B: return 2;
        case Letter.C: return 2;
        case Letter.D: return 4;
        case Letter.E: return 15;
        case Letter.F: return 2;
        case Letter.G: return 3;
        case Letter.H: return 4;
        case Letter.I: return 6;
        case Letter.J: return 1;
        case Letter.K: return 2;
        case Letter.L: return 3;
        case Letter.M: return 4;
        case Letter.N: return 9;
        case Letter.P: return 1;
        case Letter.O: return 3;
        case Letter.Q: return 1;
        case Letter.R: return 6;
        case Letter.S: return 7;
        case Letter.T: return 6;
        case Letter.U: return 6;
        case Letter.V: return 1;
        case Letter.W: return 1;
        case Letter.X: return 1;
        case Letter.Y: return 1;
        case Letter.Z: return 1;
        case Letter.AE: return 1;
        case Letter.OE: return 1;
        case Letter.UE: return 1;
        default:
            invariant(letter);
    }
}