"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var TokenMap_js_1 = require("../TokenMap.js");
var UnitUtil_js_1 = require("../UnitUtil.js");
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var Entities_js_1 = require("../../../util/Entities.js");
var BaseConfiguration_js_1 = require("../base/BaseConfiguration.js");
var UnicodeCache = {};
var UnicodeMethods = {
    Unicode: function (parser, name) {
        var HD = parser.GetBrackets(name);
        var HDsplit = null;
        var font = '';
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
            throw new TexError_js_1.default('BadFont', "Font name for %1 can't contain semicolons", parser.currentCS);
        }
        var n = UnitUtil_js_1.UnitUtil.trimSpaces(parser.GetArgument(name)).replace(/^0x/, 'x');
        if (!n.match(/^(x[0-9A-Fa-f]+|[0-9]+)$/)) {
            throw new TexError_js_1.default('BadUnicode', 'Argument to %1 must be a number', parser.currentCS);
        }
        var N = parseInt(n.match(/^x/) ? '0' + n : n);
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
        var variant = parser.stack.env.font;
        var def = {};
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
        var node = parser.create('token', 'mtext', def, (0, Entities_js_1.numeric)(n));
        NodeUtil_js_1.default.setProperty(node, 'unicode', true);
        parser.Push(node);
    },
    RawUnicode: function (parser, name) {
        var hex = parser.GetArgument(name).trim();
        if (!hex.match(/^[0-9A-F]{1,6}$/)) {
            throw new TexError_js_1.default('BadRawUnicode', 'Argument to %1 must a hexadecimal number with 1 to 6 digits', parser.currentCS);
        }
        var n = parseInt(hex, 16);
        parser.string = String.fromCodePoint(n) + parser.string.substring(parser.i);
        parser.i = 0;
    },
    Char: function (parser, _name) {
        var match;
        var next = parser.GetNext();
        var c = '';
        var text = parser.string.substring(parser.i);
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
                    var cs = __spreadArray([], __read(parser.GetCS()), false);
                    if (cs.length > 1) {
                        throw new TexError_js_1.default('InvalidAlphanumeric', 'Invalid alphanumeric constant for %1', parser.currentCS);
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
            throw new TexError_js_1.default('MissingNumber', 'Missing numeric constant for %1', parser.currentCS);
        }
        parser.i += match[0].length;
        if (c >= '0' && c <= '9') {
            parser.Push(parser.create('token', 'mn', {}, c));
        }
        else if (c.match(/[A-Za-z]/)) {
            parser.Push(parser.create('token', 'mi', {}, c));
        }
        else {
            (0, BaseConfiguration_js_1.Other)(parser, c);
        }
    },
};
new TokenMap_js_1.CommandMap('unicode', {
    unicode: UnicodeMethods.Unicode,
    U: UnicodeMethods.RawUnicode,
    char: UnicodeMethods.Char,
});
exports.UnicodeConfiguration = Configuration_js_1.Configuration.create('unicode', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['unicode'], _b),
    _a));
//# sourceMappingURL=UnicodeConfiguration.js.map