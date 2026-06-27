"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var HtmlMethods_js_1 = __importDefault(require("./HtmlMethods.js"));
new TokenMap_js_1.CommandMap('html_macros', {
    data: HtmlMethods_js_1.default.Data,
    href: HtmlMethods_js_1.default.Href,
    class: HtmlMethods_js_1.default.Class,
    style: HtmlMethods_js_1.default.Style,
    cssId: HtmlMethods_js_1.default.Id,
});
exports.HtmlConfiguration = Configuration_js_1.Configuration.create('html', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['html_macros'], _b),
    _a));
//# sourceMappingURL=HtmlConfiguration.js.map