"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewcommandConfiguration = void 0;
exports.NewcommandConfig = NewcommandConfig;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var NewcommandItems_js_1 = require("./NewcommandItems.js");
var NewcommandUtil_js_1 = require("./NewcommandUtil.js");
require("./NewcommandMappings.js");
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
var sm = __importStar(require("../TokenMap.js"));
function NewcommandConfig(_config, jax) {
    var _a;
    if (jax.parseOptions.packageData.has('newcommand')) {
        return;
    }
    jax.parseOptions.packageData.set('newcommand', {});
    new sm.DelimiterMap(NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER, ParseMethods_js_1.default.delimiter, {});
    new sm.CommandMap(NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND, {});
    new sm.EnvironmentMap(NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT, ParseMethods_js_1.default.environment, {});
    jax.parseOptions.handlers.add((_a = {},
        _a[HandlerTypes_js_1.HandlerType.CHARACTER] = [],
        _a[HandlerTypes_js_1.HandlerType.DELIMITER] = [NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER],
        _a[HandlerTypes_js_1.HandlerType.MACRO] = [
            NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER,
            NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND,
        ],
        _a[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = [NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT],
        _a), {}, NewcommandUtil_js_1.NewcommandPriority);
}
exports.NewcommandConfiguration = Configuration_js_1.Configuration.create('newcommand', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = {
        macro: ['Newcommand-macros'],
    },
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_b = {},
        _b[NewcommandItems_js_1.BeginEnvItem.prototype.kind] = NewcommandItems_js_1.BeginEnvItem,
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        maxMacros: 1000,
        protectedMacros: ['begingroupSandbox'],
    },
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = NewcommandConfig,
    _a));
//# sourceMappingURL=NewcommandConfiguration.js.map