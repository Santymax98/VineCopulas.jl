"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionConfiguration = exports.ActionMethods = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TexParser_js_1 = __importDefault(require("../TexParser.js"));
var TokenMap_js_1 = require("../TokenMap.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
exports.ActionMethods = {
    Toggle: function (parser, name) {
        var children = [];
        var arg;
        while ((arg = parser.GetArgument(name)) !== '\\endtoggle') {
            children.push(new TexParser_js_1.default(arg, parser.stack.env, parser.configuration).mml());
        }
        parser.Push(parser.create('node', 'maction', children, { actiontype: 'toggle' }));
    },
    Mathtip: function (parser, name) {
        var arg = parser.ParseArg(name);
        var tip = parser.ParseArg(name);
        parser.Push(parser.create('node', 'maction', [arg, tip], { actiontype: 'tooltip' }));
    },
    Macro: BaseMethods_js_1.default.Macro,
};
new TokenMap_js_1.CommandMap('action-macros', {
    toggle: exports.ActionMethods.Toggle,
    mathtip: exports.ActionMethods.Mathtip,
    texttip: [exports.ActionMethods.Macro, '\\mathtip{#1}{\\text{#2}}', 2],
});
exports.ActionConfiguration = Configuration_js_1.Configuration.create('action', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['action-macros'], _b),
    _a));
//# sourceMappingURL=ActionConfiguration.js.map