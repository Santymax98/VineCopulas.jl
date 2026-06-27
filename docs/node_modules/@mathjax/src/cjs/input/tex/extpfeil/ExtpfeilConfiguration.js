"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtpfeilConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var AmsMethods_js_1 = require("../ams/AmsMethods.js");
var NewcommandUtil_js_1 = require("../newcommand/NewcommandUtil.js");
var NewcommandConfiguration_js_1 = require("../newcommand/NewcommandConfiguration.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var ExtpfeilMethods = {
    NewExtArrow: function (parser, name) {
        var cs = parser.GetArgument(name);
        var space = parser.GetArgument(name);
        var chr = parser.GetArgument(name);
        if (!cs.match(/^\\([a-z]+|.)$/i)) {
            throw new TexError_js_1.default('NewextarrowArg1', 'First argument to %1 must be a control sequence name', name);
        }
        if (!space.match(/^(\d+),(\d+)$/)) {
            throw new TexError_js_1.default('NewextarrowArg2', 'Second argument to %1 must be two integers separated by a comma', name);
        }
        if (!chr.match(/^(\d+|0x[0-9A-F]+)$/i)) {
            throw new TexError_js_1.default('NewextarrowArg3', 'Third argument to %1 must be a unicode character number', name);
        }
        cs = cs.substring(1);
        var spaces = space.split(',');
        NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, ExtpfeilMethods.xArrow, [
            parseInt(chr),
            parseInt(spaces[0]),
            parseInt(spaces[1]),
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    xArrow: AmsMethods_js_1.AmsMethods.xArrow,
};
new TokenMap_js_1.CommandMap('extpfeil', {
    xtwoheadrightarrow: [ExtpfeilMethods.xArrow, 0x21a0, 12, 16],
    xtwoheadleftarrow: [ExtpfeilMethods.xArrow, 0x219e, 17, 13],
    xmapsto: [ExtpfeilMethods.xArrow, 0x21a6, 6, 7],
    xlongequal: [ExtpfeilMethods.xArrow, 0x003d, 7, 7],
    xtofrom: [ExtpfeilMethods.xArrow, 0x21c4, 12, 12],
    Newextarrow: ExtpfeilMethods.NewExtArrow,
});
exports.ExtpfeilConfiguration = Configuration_js_1.Configuration.create('extpfeil', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['extpfeil'], _b),
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = NewcommandConfiguration_js_1.NewcommandConfig,
    _a));
//# sourceMappingURL=ExtpfeilConfiguration.js.map