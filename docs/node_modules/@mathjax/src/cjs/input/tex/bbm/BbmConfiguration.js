"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BbmConfiguration = exports.BbmMethods = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
exports.BbmMethods = {
    ChooseFont: function (parser, name, regular, bold) {
        BaseMethods_js_1.default.MathFont(parser, name, parser.options.bbm.bold ? bold : regular);
    },
    ChangeBold: function (parser, name) {
        var font = parser.GetArgument(name);
        parser.options.bbm.bold = font === 'bold' ? true : false;
    },
    MathFont: BaseMethods_js_1.default.MathFont,
};
new TokenMap_js_1.CommandMap('bbm', {
    mathversion: exports.BbmMethods.ChangeBold,
    mathbbm: [exports.BbmMethods.ChooseFont, '-bbm-normal', '-bbm-bold'],
    mathbbmss: [exports.BbmMethods.ChooseFont, '-bbm-sans-serif', '-bbm-sans-serif-bold'],
    mathbbmtt: [exports.BbmMethods.MathFont, '-bbm-monospace'],
});
exports.BbmConfiguration = Configuration_js_1.Configuration.create('bbm', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['bbm'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        bbm: {
            bold: false,
        },
    },
    _a));
//# sourceMappingURL=BbmConfiguration.js.map