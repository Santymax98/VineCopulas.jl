"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextcompConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
require("./TextcompMappings.js");
Configuration_js_1.Configuration.create('text-textcomp', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.PARSER] = 'text',
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['textcomp-macros'], _b),
    _a));
exports.TextcompConfiguration = Configuration_js_1.Configuration.create('textcomp', (_c = {},
    _c[HandlerTypes_js_1.ConfigurationType.HANDLER] = { macro: ['textcomp-macros'] },
    _c.config = function (_config, jax) {
        var textmacros = jax.parseOptions.packageData.get('textmacros');
        if (textmacros) {
            textmacros.parseOptions.options.textmacros.packages.push('text-textcomp');
            textmacros.textConf.add('text-textcomp', jax, {});
        }
    },
    _c));
//# sourceMappingURL=TextcompConfiguration.js.map