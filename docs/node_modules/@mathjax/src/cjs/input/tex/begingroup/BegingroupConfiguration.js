"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BegingroupConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var BegingroupStack_js_1 = require("./BegingroupStack.js");
var BegingroupMethods_js_1 = require("./BegingroupMethods.js");
new TokenMap_js_1.CommandMap('begingroup', {
    begingroup: BegingroupMethods_js_1.BegingroupMethods.begingroup,
    endgroup: BegingroupMethods_js_1.BegingroupMethods.endgroup,
    global: BegingroupMethods_js_1.BegingroupMethods.global,
    gdef: [BegingroupMethods_js_1.BegingroupMethods.macro, '\\global\\def'],
    begingroupReset: BegingroupMethods_js_1.BegingroupMethods.reset,
    begingroupSandbox: BegingroupMethods_js_1.BegingroupMethods.sandbox,
});
exports.BegingroupConfiguration = Configuration_js_1.Configuration.create('begingroup', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['begingroup'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = function (_config, jax) {
        jax.parseOptions.packageData.set('begingroup', {
            stack: new BegingroupStack_js_1.BegingroupStack(jax.parseOptions),
        });
    },
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        begingroup: {
            allowGlobal: [
                'let',
                'def',
                'newcommand',
                'DeclareMathOperator',
                'Newextarrow',
            ],
        },
    },
    _a[HandlerTypes_js_1.ConfigurationType.PREPROCESSORS] = [
        function (_a) {
            var parser = _a.data;
            return (0, BegingroupStack_js_1.begingroupStack)(parser).remove();
        },
    ],
    _a[HandlerTypes_js_1.ConfigurationType.POSTPROCESSORS] = [
        function (_a) {
            var parser = _a.data;
            return (0, BegingroupStack_js_1.begingroupStack)(parser).finish();
        },
    ],
    _a));
//# sourceMappingURL=BegingroupConfiguration.js.map