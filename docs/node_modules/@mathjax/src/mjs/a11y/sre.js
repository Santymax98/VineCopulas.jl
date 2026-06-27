import { Engine } from '#sre/common/engine.js';
import { parseInput } from '#sre/common/dom_util.js';
import { Variables } from '#sre/common/variables.js';
import { semanticMathmlSync } from '#sre/enrich_mathml/enrich.js';
import { addPreference as addPref, fromPreference as fromPref, toPreference as toPref, } from '#sre/speech_rules/clearspeak_preference_string.js';
export const locales = Variables.LOCALES;
export const setupEngine = (x) => {
    return Engine.getInstance().setup(x);
};
export const engineSetup = () => {
    return Engine.getInstance().json();
};
export const toEnriched = (mml) => {
    return semanticMathmlSync(mml, Engine.getInstance().options);
};
export const parseDOM = parseInput;
export const addPreference = addPref;
export const fromPreference = fromPref;
export const toPreference = toPref;
//# sourceMappingURL=sre.js.map