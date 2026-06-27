"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerType = exports.ConfigurationType = void 0;
var ConfigurationType;
(function (ConfigurationType) {
    ConfigurationType["HANDLER"] = "handler";
    ConfigurationType["FALLBACK"] = "fallback";
    ConfigurationType["ITEMS"] = "items";
    ConfigurationType["TAGS"] = "tags";
    ConfigurationType["OPTIONS"] = "options";
    ConfigurationType["NODES"] = "nodes";
    ConfigurationType["PREPROCESSORS"] = "preprocessors";
    ConfigurationType["POSTPROCESSORS"] = "postprocessors";
    ConfigurationType["INIT"] = "init";
    ConfigurationType["CONFIG"] = "config";
    ConfigurationType["PRIORITY"] = "priority";
    ConfigurationType["PARSER"] = "parser";
})(ConfigurationType || (exports.ConfigurationType = ConfigurationType = {}));
var HandlerType;
(function (HandlerType) {
    HandlerType["DELIMITER"] = "delimiter";
    HandlerType["MACRO"] = "macro";
    HandlerType["CHARACTER"] = "character";
    HandlerType["ENVIRONMENT"] = "environment";
})(HandlerType || (exports.HandlerType = HandlerType = {}));
//# sourceMappingURL=HandlerTypes.js.map