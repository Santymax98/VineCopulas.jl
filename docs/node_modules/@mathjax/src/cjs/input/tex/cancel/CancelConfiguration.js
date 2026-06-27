"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelConfiguration = exports.CancelMethods = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TexConstants_js_1 = require("../TexConstants.js");
var TokenMap_js_1 = require("../TokenMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var EncloseConfiguration_js_1 = require("../enclose/EncloseConfiguration.js");
exports.CancelMethods = {
    Cancel: function (parser, name, notation) {
        var attr = parser.GetBrackets(name, '');
        var math = parser.ParseArg(name);
        var def = ParseUtil_js_1.ParseUtil.keyvalOptions(attr, EncloseConfiguration_js_1.ENCLOSE_OPTIONS);
        def['notation'] = notation;
        parser.Push(parser.create('node', 'menclose', [math], def));
    },
    CancelTo: function (parser, name) {
        var attr = parser.GetBrackets(name, '');
        var value = parser.ParseArg(name);
        var math = parser.ParseArg(name);
        var def = ParseUtil_js_1.ParseUtil.keyvalOptions(attr, EncloseConfiguration_js_1.ENCLOSE_OPTIONS);
        def['notation'] = [
            TexConstants_js_1.TexConstant.Notation.UPDIAGONALSTRIKE,
            TexConstants_js_1.TexConstant.Notation.UPDIAGONALARROW,
            TexConstants_js_1.TexConstant.Notation.NORTHEASTARROW,
        ].join(' ');
        value = parser.create('node', 'mpadded', [value], {
            depth: '-.1em',
            height: '+.1em',
            voffset: '.1em',
        });
        parser.Push(parser.create('node', 'msup', [
            parser.create('node', 'menclose', [math], def),
            value,
        ]));
    },
};
new TokenMap_js_1.CommandMap('cancel', {
    cancel: [exports.CancelMethods.Cancel, TexConstants_js_1.TexConstant.Notation.UPDIAGONALSTRIKE],
    bcancel: [exports.CancelMethods.Cancel, TexConstants_js_1.TexConstant.Notation.DOWNDIAGONALSTRIKE],
    xcancel: [
        exports.CancelMethods.Cancel,
        TexConstants_js_1.TexConstant.Notation.UPDIAGONALSTRIKE +
            ' ' +
            TexConstants_js_1.TexConstant.Notation.DOWNDIAGONALSTRIKE,
    ],
    cancelto: exports.CancelMethods.CancelTo,
});
exports.CancelConfiguration = Configuration_js_1.Configuration.create('cancel', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['cancel'], _b),
    _a));
//# sourceMappingURL=CancelConfiguration.js.map