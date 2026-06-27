import { parseInput } from '#sre/common/dom_util.js';
import { addPreference as addPref, fromPreference as fromPref, toPreference as toPref } from '#sre/speech_rules/clearspeak_preference_string.js';
export declare const locales: Map<string, string>;
export declare const setupEngine: (x: {
    [key: string]: string | boolean;
}) => void;
export declare const engineSetup: () => {
    [key: string]: string | boolean;
};
export declare const toEnriched: (mml: string) => Element;
export declare const parseDOM: typeof parseInput;
export declare const addPreference: typeof addPref;
export declare const fromPreference: typeof fromPref;
export declare const toPreference: typeof toPref;
