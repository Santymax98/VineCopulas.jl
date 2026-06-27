"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DsfontConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
function ChooseFont(parser, name) {
    BaseMethods_js_1.default.MathFont(parser, name, parser.options.dsfont.sans ? '-ds-ss' : '-ds-rm');
}
new TokenMap_js_1.CommandMap('dsfont', {
    mathds: ChooseFont,
});
exports.DsfontConfiguration = Configuration_js_1.Configuration.create('dsfont', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['dsfont'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        dsfont: {
            sans: false,
        },
    },
    _a));
//# sourceMappingURL=DsfontConfiguration.js.map