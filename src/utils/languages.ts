import { Language } from "../types";
import { FlagNameValues } from "semantic-ui-react";

export function getLanguages(): Language[] {
    return [
        Language.ENGLISH,
        Language.GERMAN
    ];
}

export function getFlagIcon(language: Language): FlagNameValues {
    switch (language) {
        case Language.ENGLISH: return "us";
        case Language.GERMAN: return "de";
    }
}

export function getLanguageName(language: Language): string {
    switch (language) {
        case Language.ENGLISH: return "English";
        case Language.GERMAN: return "Deutsch";
    }
}