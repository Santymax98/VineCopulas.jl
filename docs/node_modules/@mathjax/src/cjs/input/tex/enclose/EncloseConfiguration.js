"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncloseConfiguration = exports.EncloseMethods = exports.ENCLOSE_OPTIONS = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
exports.ENCLOSE_OPTIONS = {
    'data-arrowhead': 1,
    color: 1,
    mathcolor: 1,
    background: 1,
    mathbackground: 1,
    'data-padding': 1,
    'data-thickness': 1,
};
exports.EncloseMethods = {
    Enclose: function (parser, name) {
        var notation = parser.GetArgument(name).replace(/,/g, ' ');
        var attr = parser.GetBrackets(name, '');
        var math = parser.ParseArg(name);
        var def = ParseUtil_js_1.ParseUtil.keyvalOptions(attr, exports.ENCLOSE_OPTIONS);
        def.notation = notation;
        parser.Push(parser.create('node', 'menclose', [math], def));
    },
};
new TokenMap_js_1.CommandMap('enclose', { enclose: exports.EncloseMethods.Enclose });
exports.EncloseConfiguration = Configuration_js_1.Configuration.create('enclose', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['enclose'], _b),
    _a));
//# sourceMappingURL=EncloseConfiguration.js.map