"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var BussproofsMethods_js_1 = __importDefault(require("./BussproofsMethods.js"));
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
var TokenMap_js_1 = require("../TokenMap.js");
new TokenMap_js_1.CommandMap('Bussproofs-macros', {
    AxiomC: BussproofsMethods_js_1.default.Axiom,
    UnaryInfC: [BussproofsMethods_js_1.default.Inference, 1],
    BinaryInfC: [BussproofsMethods_js_1.default.Inference, 2],
    TrinaryInfC: [BussproofsMethods_js_1.default.Inference, 3],
    QuaternaryInfC: [BussproofsMethods_js_1.default.Inference, 4],
    QuinaryInfC: [BussproofsMethods_js_1.default.Inference, 5],
    RightLabel: [BussproofsMethods_js_1.default.Label, 'right'],
    LeftLabel: [BussproofsMethods_js_1.default.Label, 'left'],
    AXC: BussproofsMethods_js_1.default.Axiom,
    UIC: [BussproofsMethods_js_1.default.Inference, 1],
    BIC: [BussproofsMethods_js_1.default.Inference, 2],
    TIC: [BussproofsMethods_js_1.default.Inference, 3],
    RL: [BussproofsMethods_js_1.default.Label, 'right'],
    LL: [BussproofsMethods_js_1.default.Label, 'left'],
    noLine: [BussproofsMethods_js_1.default.SetLine, 'none', false],
    singleLine: [BussproofsMethods_js_1.default.SetLine, 'solid', false],
    solidLine: [BussproofsMethods_js_1.default.SetLine, 'solid', false],
    dashedLine: [BussproofsMethods_js_1.default.SetLine, 'dashed', false],
    alwaysNoLine: [BussproofsMethods_js_1.default.SetLine, 'none', true],
    alwaysSingleLine: [BussproofsMethods_js_1.default.SetLine, 'solid', true],
    alwaysSolidLine: [BussproofsMethods_js_1.default.SetLine, 'solid', true],
    alwaysDashedLine: [BussproofsMethods_js_1.default.SetLine, 'dashed', true],
    rootAtTop: [BussproofsMethods_js_1.default.RootAtTop, true],
    alwaysRootAtTop: [BussproofsMethods_js_1.default.RootAtTop, true],
    rootAtBottom: [BussproofsMethods_js_1.default.RootAtTop, false],
    alwaysRootAtBottom: [BussproofsMethods_js_1.default.RootAtTop, false],
    fCenter: BussproofsMethods_js_1.default.FCenter,
    Axiom: BussproofsMethods_js_1.default.AxiomF,
    UnaryInf: [BussproofsMethods_js_1.default.InferenceF, 1],
    BinaryInf: [BussproofsMethods_js_1.default.InferenceF, 2],
    TrinaryInf: [BussproofsMethods_js_1.default.InferenceF, 3],
    QuaternaryInf: [BussproofsMethods_js_1.default.InferenceF, 4],
    QuinaryInf: [BussproofsMethods_js_1.default.InferenceF, 5],
});
new TokenMap_js_1.EnvironmentMap('Bussproofs-environments', ParseMethods_js_1.default.environment, {
    prooftree: [BussproofsMethods_js_1.default.Prooftree, null, false],
});
//# sourceMappingURL=BussproofsMappings.js.map