"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPreference = exports.fromPreference = exports.addPreference = exports.parseDOM = exports.toEnriched = exports.engineSetup = exports.setupEngine = exports.locales = void 0;
var engine_js_1 = require("#sre/common/engine.js");
var dom_util_js_1 = require("#sre/common/dom_util.js");
var variables_js_1 = require("#sre/common/variables.js");
var enrich_js_1 = require("#sre/enrich_mathml/enrich.js");
var clearspeak_preference_string_js_1 = require("#sre/speech_rules/clearspeak_preference_string.js");
exports.locales = variables_js_1.Variables.LOCALES;
var setupEngine = function (x) {
    return engine_js_1.Engine.getInstance().setup(x);
};
exports.setupEngine = setupEngine;
var engineSetup = function () {
    return engine_js_1.Engine.getInstance().json();
};
exports.engineSetup = engineSetup;
var toEnriched = function (mml) {
    return (0, enrich_js_1.semanticMathmlSync)(mml, engine_js_1.Engine.getInstance().options);
};
exports.toEnriched = toEnriched;
exports.parseDOM = dom_util_js_1.parseInput;
exports.addPreference = clearspeak_preference_string_js_1.addPreference;
exports.fromPreference = clearspeak_preference_string_js_1.fromPreference;
exports.toPreference = clearspeak_preference_string_js_1.toPreference;
//# sourceMappingURL=sre.js.map