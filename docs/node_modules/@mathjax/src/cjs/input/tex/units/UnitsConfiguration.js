"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsConfiguration = exports.UnitsMethods = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TexParser_js_1 = __importDefault(require("../TexParser.js"));
var TokenMap_js_1 = require("../TokenMap.js");
exports.UnitsMethods = {
    Unit: function (parser, name) {
        var val = parser.GetBrackets(name);
        var dim = parser.GetArgument(name);
        var macro = "\\mathrm{".concat(dim, "}");
        if (val) {
            macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
        }
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
    },
    UnitFrac: function (parser, name) {
        var val = parser.GetBrackets(name);
        var num = parser.GetArgument(name);
        var den = parser.GetArgument(name);
        var macro = "\\nicefrac[\\mathrm]{".concat(num, "}{").concat(den, "}");
        if (val) {
            macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
        }
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
    },
    NiceFrac: function (parser, name) {
        var font = parser.GetBrackets(name, '\\mathrm');
        var num = parser.GetArgument(name);
        var den = parser.GetArgument(name);
        var numMml = new TexParser_js_1.default("".concat(font, "{").concat(num, "}"), __assign({}, parser.stack.env), parser.configuration).mml();
        var denMml = new TexParser_js_1.default("".concat(font, "{").concat(den, "}"), __assign({}, parser.stack.env), parser.configuration).mml();
        var def = parser.options.units.ugly ? {} : { bevelled: true };
        var node = parser.create('node', 'mfrac', [numMml, denMml], def);
        parser.Push(node);
    },
};
new TokenMap_js_1.CommandMap('units', {
    units: exports.UnitsMethods.Unit,
    unitfrac: exports.UnitsMethods.UnitFrac,
    nicefrac: exports.UnitsMethods.NiceFrac,
});
exports.UnitsConfiguration = Configuration_js_1.Configuration.create('units', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['units'], _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        units: {
            loose: false,
            ugly: false,
        },
    },
    _a));
//# sourceMappingURL=UnitsConfiguration.js.map