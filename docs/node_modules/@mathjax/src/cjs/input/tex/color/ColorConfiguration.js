"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var TokenMap_js_1 = require("../TokenMap.js");
var Configuration_js_1 = require("../Configuration.js");
var ColorMethods_js_1 = require("./ColorMethods.js");
var ColorUtil_js_1 = require("./ColorUtil.js");
new TokenMap_js_1.CommandMap('color', {
    color: ColorMethods_js_1.ColorMethods.Color,
    textcolor: ColorMethods_js_1.ColorMethods.TextColor,
    definecolor: ColorMethods_js_1.ColorMethods.DefineColor,
    colorbox: ColorMethods_js_1.ColorMethods.ColorBox,
    fcolorbox: ColorMethods_js_1.ColorMethods.FColorBox,
});
var config = function (_config, jax) {
    jax.parseOptions.packageData.set('color', { model: new ColorUtil_js_1.ColorModel() });
};
exports.ColorConfiguration = Configuration_js_1.Configuration.create('color', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['color'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        color: {
            padding: '5px',
            borderWidth: '2px',
        },
    },
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = config,
    _a));
//# sourceMappingURL=ColorConfiguration.js.map