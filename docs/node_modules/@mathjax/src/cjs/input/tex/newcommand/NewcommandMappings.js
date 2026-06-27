"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var NewcommandMethods_js_1 = __importDefault(require("./NewcommandMethods.js"));
var TokenMap_js_1 = require("../TokenMap.js");
new TokenMap_js_1.CommandMap('Newcommand-macros', {
    newcommand: NewcommandMethods_js_1.default.NewCommand,
    renewcommand: NewcommandMethods_js_1.default.NewCommand,
    newenvironment: NewcommandMethods_js_1.default.NewEnvironment,
    renewenvironment: NewcommandMethods_js_1.default.NewEnvironment,
    def: NewcommandMethods_js_1.default.MacroDef,
    let: NewcommandMethods_js_1.default.Let,
});
//# sourceMappingURL=NewcommandMappings.js.map