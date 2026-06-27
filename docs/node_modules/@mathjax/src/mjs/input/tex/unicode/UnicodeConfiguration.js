import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import TexError from '../TexError.js';
import { CommandMap } from '../TokenMap.js';
import { UnitUtil } from '../UnitUtil.js';
import NodeUtil from '../NodeUtil.js';
import { numeric } from '../../../util/Entities.js';
import { Other } from '../base/BaseConfiguration.js';
const UnicodeCache = {};
const UnicodeMethods = {
    Unicode(parser, name) {
        const HD = parser.GetBrackets(name);
        let HDsplit = null;
        let font = '';
        if (HD) {
            if (HD.replace(/ /g, '').match(/^(\d+(\.\d*)?|\.\d+),(\d+(\.\d*)?|\.\d+)$/)) {
                HDsplit = HD.replace(/ /g, '').split(/,/);
                font = parser.GetBrackets(name) || '';
            }
            else {
                font = HD;
            }
        }
        if (font.match(/;/)) {
            throw new TexError('BadFont', "Font name for %1 can't contain semicolons", parser.currentCS);
        }
        const n = UnitUtil.trimSpaces(parser.GetArgument(name)).replace(/^0x/, 'x');
        if (!n.match(/^(x[0-9A-Fa-f]+|[0-9]+)$/)) {
            throw new TexError('BadUnicode', 'Argument to %1 must be a number', parser.currentCS);
        }
        const N = parseInt(n.match(/^x/) ? '0' + n : n);
        if (!UnicodeCache[N]) {
            UnicodeCache[N] = [800, 200, font, N];
        }
        else if (!font) {
            font = UnicodeCache[N][2];
        }
        if (HDsplit) {
            UnicodeCache[N][0] = Math.floor(parseFloat(HDsplit[0]) * 1000);
            UnicodeCache[N][1] = Math.floor(parseFloat(HDsplit[1]) * 1000);
        }
        const variant = parser.stack.env.font;
        const def = {};
        if (font) {
            UnicodeCache[N][2] = def.fontfamily = font.replace(/'/g, "'");
            if (variant) {
                if (variant.match(/bold/)) {
                    def.fontweight = 'bold';
                }
                if (variant.match(/italic|-mathit/)) {
                    def.fontstyle = 'italic';
                }
            }
        }
        else if (variant) {
            def.mathvariant = variant;
        }
        const node = parser.create('token', 'mtext', def, numeric(n));
        NodeUtil.setProperty(node, 'unicode', true);
        parser.Push(node);
    },
    RawUnicode(parser, name) {
        const hex = parser.GetArgument(name).trim();
        if (!hex.match(/^[0-9A-F]{1,6}$/)) {
            throw new TexError('BadRawUnicode', 'Argument to %1 must a hexadecimal number with 1 to 6 digits', parser.currentCS);
        }
        const n = parseInt(hex, 16);
        parser.string = String.fromCodePoint(n) + parser.string.substring(parser.i);
        parser.i = 0;
    },
    Char(parser, _name) {
        let match;
        const next = parser.GetNext();
        let c = '';
        const text = parser.string.substring(parser.i);
        if (next === "'") {
            match = text.match(/^'([0-7]{1,7}) ?/u);
            if (match) {
                c = String.fromCodePoint(parseInt(match[1], 8));
            }
        }
        else if (next === '"') {
            match = text.match(/^"([0-9A-F]{1,6}) ?/);
            if (match) {
                c = String.fromCodePoint(parseInt(match[1], 16));
            }
        }
        else if (next === '`') {
            match = text.match(/^`(?:(\\\S)|(.))/u);
            if (match) {
                if (match[2]) {
                    c = match[2];
                }
                else {
                    parser.i += 2;
                    const cs = [...parser.GetCS()];
                    if (cs.length > 1) {
                        throw new TexError('InvalidAlphanumeric', 'Invalid alphanumeric constant for %1', parser.currentCS);
                    }
                    c = cs[0];
                    match = [''];
                }
            }
        }
        else {
            match = text.match(/^([0-9]{1,7}) ?/);
            if (match) {
                c = String.fromCodePoint(parseInt(match[1]));
            }
        }
        if (!c) {
            throw new TexError('MissingNumber', 'Missing numeric constant for %1', parser.currentCS);
        }
        parser.i += match[0].length;
        if (c >= '0' && c <= '9') {
            parser.Push(parser.create('token', 'mn', {}, c));
        }
        else if (c.match(/[A-Za-z]/)) {
            parser.Push(parser.create('token', 'mi', {}, c));
        }
        else {
            Other(parser, c);
        }
    },
};
new CommandMap('unicode', {
    unicode: UnicodeMethods.Unicode,
    U: UnicodeMethods.RawUnicode,
    char: UnicodeMethods.Char,
});
export const UnicodeConfiguration = Configuration.create('unicode', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['unicode'] },
});
//# sourceMappingURL=UnicodeConfiguration.js.map