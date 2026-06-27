"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BboldxMethods = void 0;
var TextMacrosMethods_js_1 = require("../textmacros/TextMacrosMethods.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
exports.BboldxMethods = {
    Macro: BaseMethods_js_1.default.Macro,
    ChooseFont: function (parser, name, normal, light, bfbb) {
        var font = getBbxFont(parser, normal, light, bfbb);
        BaseMethods_js_1.default.MathFont(parser, name, font);
    },
    ChooseTextFont: function (parser, name, normal, light, bfbb) {
        var font = getBbxFont(parser, normal, light, bfbb);
        TextMacrosMethods_js_1.TextMacrosMethods.TextFont(parser, name, font);
    },
    mathchar0miNormal: function (parser, mchar) {
        var font = getBbxFont(parser, '-bboldx', '-bboldx-light', '-bboldx-bold');
        var node = parser.create('token', 'mi', { mathvariant: font }, mchar.char);
        parser.Push(node);
    },
    delimiterNormal: function (parser, delim) {
        var font = getBbxFont(parser, '-bboldx', '-bboldx-light', '-bboldx-bold');
        var def = { stretchy: false, mathvariant: font };
        var node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    },
    mathchar0miBold: function (parser, mchar) {
        var font = getBbxFont(parser, '-bboldx-bold', '-bboldx', '-bboldx-bold');
        var node = parser.create('token', 'mi', { mathvariant: font }, mchar.char);
        parser.Push(node);
    },
    delimiterBold: function (parser, delim) {
        var font = getBbxFont(parser, '-bboldx-bold', '-bboldx', '-bboldx-bold');
        var def = { stretchy: false, mathvariant: font };
        var node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    },
};
function getBbxFont(parser, normal, light, bfbb) {
    var options = parser.options.bboldx;
    return options.bfbb ? bfbb : options.light ? light : normal;
}
//# sourceMappingURL=BboldxMethods.js.map