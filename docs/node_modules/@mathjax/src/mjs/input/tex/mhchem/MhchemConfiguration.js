import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap, CharacterMap } from '../TokenMap.js';
import TexError from '../TexError.js';
import BaseMethods from '../base/BaseMethods.js';
import { AmsMethods } from '../ams/AmsMethods.js';
import { mhchemParser } from '#mhchem/mhchemParser.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
export const MhchemUtils = {
    relmo(parser, mchar) {
        const def = Object.assign({ stretchy: true, texClass: TEXCLASS.REL, mathvariant: '-mhchem' }, (mchar.attributes || {}));
        const node = parser.create('token', 'mo', def, mchar.char);
        parser.Push(node);
    },
};
export const MhchemReplacements = new Map([
    [
        '\\mhchemx$3[$1]{$2}',
        /\\underset{\\lower2mu{(.*?)}}{\\overset{(.*?)}{\\long(.*?)}}/g,
    ],
    ['\\mhchemx$2{$1}', /\\overset{(.*?)}{\\long(.*?)}/g],
    [
        '\\mhchemBondTD',
        /\\rlap\{\\lower\.1em\{-\}\}\\raise\.1em\{\\tripledash\}/g,
    ],
    [
        '\\mhchemBondTDD',
        /\\rlap\{\\lower\.2em\{-\}\}\\rlap\{\\raise\.2em\{\\tripledash\}\}-/g,
    ],
    [
        '\\mhchemBondDTD',
        /\\rlap\{\\lower\.2em\{-\}\}\\rlap\{\\raise.2em\{-\}\}\\tripledash/g,
    ],
    [
        (match, arrow) => {
            const mharrow = `mhchem${arrow}`;
            return mhchemChars.lookup(mharrow) || mhchemMacros.lookup(mharrow)
                ? `\\${mharrow}`
                : match;
        },
        /\\(x?(?:long)?(?:left|right|[Ll]eftright|[Rr]ightleft)(?:arrow|harpoons))/g,
    ],
]);
export const MhchemMethods = {
    Machine(parser, name, machine) {
        const arg = parser.GetArgument(name);
        let tex;
        try {
            tex = mhchemParser.toTex(arg, machine);
            for (const [name, pattern] of MhchemReplacements.entries()) {
                tex = tex.replace(pattern, name);
            }
        }
        catch (err) {
            throw new TexError(err[0], err[1]);
        }
        parser.string = tex + parser.string.substring(parser.i);
        parser.i = 0;
    },
    Macro: BaseMethods.Macro,
    xArrow: AmsMethods.xArrow,
};
const mhchemMacros = new CommandMap('mhchem', {
    ce: [MhchemMethods.Machine, 'ce'],
    pu: [MhchemMethods.Machine, 'pu'],
    mhchemxrightarrow: [MhchemMethods.xArrow, 0xe429, 5, 9],
    mhchemxleftarrow: [MhchemMethods.xArrow, 0xe428, 9, 5],
    mhchemxleftrightarrow: [MhchemMethods.xArrow, 0xe42a, 9, 9],
    mhchemxleftrightarrows: [MhchemMethods.xArrow, 0xe42b, 9, 9],
    mhchemxrightleftharpoons: [MhchemMethods.xArrow, 0xe408, 5, 9],
    mhchemxRightleftharpoons: [MhchemMethods.xArrow, 0xe409, 5, 9],
    mhchemxLeftrightharpoons: [MhchemMethods.xArrow, 0xe40a, 9, 11],
});
const mhchemChars = new CharacterMap('mhchem-chars', MhchemUtils.relmo, {
    tripledash: ['\uE410', { stretchy: false }],
    mhchemBondTD: ['\uE411', { stretchy: false }],
    mhchemBondTDD: ['\uE412', { stretchy: false }],
    mhchemBondDTD: ['\uE413', { stretchy: false }],
    mhchemlongleftarrow: '\uE428',
    mhchemlongrightarrow: '\uE429',
    mhchemlongleftrightarrow: '\uE42A',
    mhchemlongrightleftharpoons: '\uE408',
    mhchemlongRightleftharpoons: '\uE409',
    mhchemlongLeftrightharpoons: '\uE40A',
    mhchemlongleftrightarrows: '\uE42B',
    mhchemrightarrow: '\uE42D',
    mhchemleftarrow: '\uE42C',
    mhchemleftrightarrow: '\uE42E',
});
export const MhchemConfiguration = Configuration.create('mhchem', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['mhchem', 'mhchem-chars'],
    },
});
//# sourceMappingURL=MhchemConfiguration.js.map