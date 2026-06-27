"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigMacrosConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var Options_js_1 = require("../../../util/Options.js");
var TokenMap_js_1 = require("../TokenMap.js");
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
var Token_js_1 = require("../Token.js");
var NewcommandMethods_js_1 = __importDefault(require("../newcommand/NewcommandMethods.js"));
var NewcommandItems_js_1 = require("../newcommand/NewcommandItems.js");
var MACROSMAP = 'configmacros-map';
var ACTIVEMAP = 'configmacros-active-map';
var ENVIRONMENTMAP = 'configmacros-env-map';
function configmacrosInit(config) {
    var _a;
    new TokenMap_js_1.MacroMap(ACTIVEMAP, {});
    new TokenMap_js_1.CommandMap(MACROSMAP, {});
    new TokenMap_js_1.EnvironmentMap(ENVIRONMENTMAP, ParseMethods_js_1.default.environment, {});
    config.append(Configuration_js_1.Configuration.local({
        handler: (_a = {},
            _a[HandlerTypes_js_1.HandlerType.CHARACTER] = [ACTIVEMAP],
            _a[HandlerTypes_js_1.HandlerType.MACRO] = [MACROSMAP],
            _a[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = [ENVIRONMENTMAP],
            _a),
        priority: 3,
    }));
}
function configmacrosConfig(_config, jax) {
    configActives(jax);
    configMacros(jax);
    configEnvironments(jax);
}
function setMacros(name, map, jax) {
    var e_1, _a;
    var handler = jax.parseOptions.handlers.retrieve(map);
    var macros = jax.parseOptions.options[name];
    try {
        for (var _b = __values(Object.keys(macros)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var cs = _c.value;
            var def = typeof macros[cs] === 'string' ? [macros[cs]] : macros[cs];
            var macro = Array.isArray(def[2])
                ? new Token_js_1.Macro(cs, NewcommandMethods_js_1.default.MacroWithTemplate, def.slice(0, 2).concat(def[2]))
                : new Token_js_1.Macro(cs, NewcommandMethods_js_1.default.Macro, def);
            handler.add(cs, macro);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function configActives(jax) {
    setMacros('active', ACTIVEMAP, jax);
}
function configMacros(jax) {
    setMacros('macros', MACROSMAP, jax);
}
function configEnvironments(jax) {
    var e_2, _a;
    var handler = jax.parseOptions.handlers.retrieve(ENVIRONMENTMAP);
    var environments = jax.parseOptions.options.environments;
    try {
        for (var _b = __values(Object.keys(environments)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var env = _c.value;
            handler.add(env, new Token_js_1.Macro(env, NewcommandMethods_js_1.default.BeginEnv, [true].concat(environments[env])));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
exports.ConfigMacrosConfiguration = Configuration_js_1.Configuration.create('configmacros', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.INIT] = configmacrosInit,
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = configmacrosConfig,
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_b = {},
        _b[NewcommandItems_js_1.BeginEnvItem.prototype.kind] = NewcommandItems_js_1.BeginEnvItem,
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        active: (0, Options_js_1.expandable)({}),
        macros: (0, Options_js_1.expandable)({}),
        environments: (0, Options_js_1.expandable)({}),
    },
    _a));
//# sourceMappingURL=ConfigMacrosConfiguration.js.map