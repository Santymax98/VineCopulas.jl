"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerbConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TexConstants_js_1 = require("../TexConstants.js");
var TokenMap_js_1 = require("../TokenMap.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var VerbMethods = {
    Verb: function (parser, name) {
        var c = parser.GetNext();
        var start = ++parser.i;
        if (c === '') {
            throw new TexError_js_1.default('MissingArgFor', 'Missing argument for %1', name);
        }
        while (parser.i < parser.string.length &&
            parser.string.charAt(parser.i) !== c) {
            parser.i++;
        }
        if (parser.i === parser.string.length) {
            throw new TexError_js_1.default('NoClosingDelim', "Can't find closing delimiter for %1", parser.currentCS);
        }
        var text = parser.string.slice(start, parser.i).replace(/ /g, '\u00A0');
        parser.i++;
        parser.Push(parser.create('token', 'mtext', { mathvariant: TexConstants_js_1.TexConstant.Variant.MONOSPACE }, text));
    },
};
new TokenMap_js_1.CommandMap('verb', { verb: VerbMethods.Verb });
exports.VerbConfiguration = Configuration_js_1.Configuration.create('verb', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['verb'], _b),
    _a));
//# sourceMappingURL=VerbConfiguration.js.map