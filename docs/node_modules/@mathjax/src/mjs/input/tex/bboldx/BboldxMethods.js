import { TextMacrosMethods } from '../textmacros/TextMacrosMethods.js';
import BaseMethods from '../base/BaseMethods.js';
export const BboldxMethods = {
    Macro: BaseMethods.Macro,
    ChooseFont: function (parser, name, normal, light, bfbb) {
        const font = getBbxFont(parser, normal, light, bfbb);
        BaseMethods.MathFont(parser, name, font);
    },
    ChooseTextFont: function (parser, name, normal, light, bfbb) {
        const font = getBbxFont(parser, normal, light, bfbb);
        TextMacrosMethods.TextFont(parser, name, font);
    },
    mathchar0miNormal: function (parser, mchar) {
        const font = getBbxFont(parser, '-bboldx', '-bboldx-light', '-bboldx-bold');
        const node = parser.create('token', 'mi', { mathvariant: font }, mchar.char);
        parser.Push(node);
    },
    delimiterNormal: function (parser, delim) {
        const font = getBbxFont(parser, '-bboldx', '-bboldx-light', '-bboldx-bold');
        const def = { stretchy: false, mathvariant: font };
        const node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    },
    mathchar0miBold: function (parser, mchar) {
        const font = getBbxFont(parser, '-bboldx-bold', '-bboldx', '-bboldx-bold');
        const node = parser.create('token', 'mi', { mathvariant: font }, mchar.char);
        parser.Push(node);
    },
    delimiterBold: function (parser, delim) {
        const font = getBbxFont(parser, '-bboldx-bold', '-bboldx', '-bboldx-bold');
        const def = { stretchy: false, mathvariant: font };
        const node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    },
};
function getBbxFont(parser, normal, light, bfbb) {
    const options = parser.options.bboldx;
    return options.bfbb ? bfbb : options.light ? light : normal;
}
//# sourceMappingURL=BboldxMethods.js.map