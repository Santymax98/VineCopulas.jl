"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BboldxConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
require("./BboldxMappings.js");
Configuration_js_1.Configuration.create('text-bboldx', {
    parser: 'text',
    handler: {
        macro: [
            'text-bboldx',
            'text-bboldx-mathchar0miNormal',
            'text-bboldx-delimiterNormal',
            'text-bboldx-mathchar0miBold',
            'text-bboldx-delimiterBold',
        ],
    },
});
exports.BboldxConfiguration = Configuration_js_1.Configuration.create('bboldx', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = [
            'bboldx',
            'bboldx-mathchar0miNormal',
            'bboldx-delimiterNormal',
            'bboldx-mathchar0miBold',
            'bboldx-delimiterBold',
        ],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        bboldx: {
            bfbb: false,
            light: false,
        },
    },
    _a.config = function (_config, jax) {
        var textmacros = jax.parseOptions.packageData.get('textmacros');
        if (textmacros) {
            textmacros.parseOptions.options.textmacros.packages.push('text-bboldx');
            textmacros.textConf.add('text-bboldx', jax, {});
        }
    },
    _a.priority = 3,
    _a));
//# sourceMappingURL=BboldxConfiguration.js.map