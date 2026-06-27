"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BegingroupMethods = void 0;
var TokenMap_js_1 = require("../TokenMap.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
var BegingroupStack_js_1 = require("./BegingroupStack.js");
exports.BegingroupMethods = {
    begingroup: function (parser, _name) {
        (0, BegingroupStack_js_1.begingroupStack)(parser.configuration).push();
    },
    endgroup: function (parser, _name) {
        (0, BegingroupStack_js_1.begingroupStack)(parser.configuration).pop();
    },
    reset: function (parser, _name) {
        (0, BegingroupStack_js_1.begingroupStack)(parser.configuration).reset();
    },
    sandbox: function (parser, _name) {
        (0, BegingroupStack_js_1.begingroupStack)(parser.configuration).sandbox();
        parser.stack.global.isSandbox = true;
    },
    global: function (parser, _name) {
        var i = parser.i;
        var cs = parser.GetNext() === '\\' ? (parser.i++, parser.GetCS()) : '';
        parser.i = i;
        if (!parser.options.begingroup.allowGlobal.includes(cs)) {
            throw new TexError_js_1.default('IllegalGlobal', 'Invalid use of %1', parser.currentCS);
        }
        parser.stack.env.isGlobal = true;
    },
    macro: BaseMethods_js_1.default.Macro,
};
new TokenMap_js_1.CommandMap('begingroup', {
    begingroup: exports.BegingroupMethods.begingroup,
    endgroup: exports.BegingroupMethods.endgroup,
    global: exports.BegingroupMethods.global,
    gdef: [exports.BegingroupMethods.macro, '\\global\\def'],
    begingroupReset: exports.BegingroupMethods.reset,
    begingroupSandbox: exports.BegingroupMethods.sandbox,
});
//# sourceMappingURL=BegingroupMethods.js.map