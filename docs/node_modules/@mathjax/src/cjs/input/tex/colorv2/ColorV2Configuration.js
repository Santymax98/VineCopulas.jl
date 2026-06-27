"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var TokenMap_js_1 = require("../TokenMap.js");
var Configuration_js_1 = require("../Configuration.js");
var ColorV2Methods = {
    Color: function (parser, name) {
        var color = parser.GetArgument(name);
        var old = parser.stack.env['color'];
        parser.stack.env['color'] = color;
        var math = parser.ParseArg(name);
        if (old) {
            parser.stack.env['color'] = old;
        }
        else {
            delete parser.stack.env['color'];
        }
        var node = parser.create('node', 'mstyle', [math], { mathcolor: color });
        parser.Push(node);
    },
};
new TokenMap_js_1.CommandMap('colorv2', { color: ColorV2Methods.Color });
exports.ColorConfiguration = Configuration_js_1.Configuration.create('colorv2', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['colorv2'], _b),
    _a));
//# sourceMappingURL=ColorV2Configuration.js.map