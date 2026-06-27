"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var TokenMap_js_1 = require("../TokenMap.js");
var BraketMethods_js_1 = __importDefault(require("./BraketMethods.js"));
new TokenMap_js_1.CommandMap('Braket-macros', {
    bra: [BraketMethods_js_1.default.Macro, '{\\langle {#1} \\vert}', 1],
    ket: [BraketMethods_js_1.default.Macro, '{\\vert {#1} \\rangle}', 1],
    braket: [BraketMethods_js_1.default.Braket, '\u27E8', '\u27E9', false, Infinity],
    set: [BraketMethods_js_1.default.Braket, '{', '}', false, 1],
    Bra: [BraketMethods_js_1.default.Macro, '{\\left\\langle {#1} \\right\\vert}', 1],
    Ket: [BraketMethods_js_1.default.Macro, '{\\left\\vert {#1} \\right\\rangle}', 1],
    Braket: [BraketMethods_js_1.default.Braket, '\u27E8', '\u27E9', true, Infinity],
    Set: [BraketMethods_js_1.default.Braket, '{', '}', true, 1, true],
    ketbra: [
        BraketMethods_js_1.default.Macro,
        '{\\vert {#1} \\rangle\\langle {#2} \\vert}',
        2,
    ],
    Ketbra: [
        BraketMethods_js_1.default.Macro,
        '{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}',
        2,
    ],
    '|': BraketMethods_js_1.default.Bar,
});
new TokenMap_js_1.MacroMap('Braket-characters', {
    '|': BraketMethods_js_1.default.Bar,
});
//# sourceMappingURL=BraketMappings.js.map