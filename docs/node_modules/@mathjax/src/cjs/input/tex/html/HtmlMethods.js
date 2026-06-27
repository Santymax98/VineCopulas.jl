"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var nonCharacterRegexp = /[\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function isLegalAttributeName(name) {
    return !(name.match(/[\x00-\x1f\x7f-\x9f "'>/=]/) ||
        name.match(nonCharacterRegexp));
}
var HtmlMethods = {
    Data: function (parser, name) {
        var dataset = parser.GetArgument(name);
        var arg = GetArgumentMML(parser, name);
        var data = ParseUtil_js_1.ParseUtil.keyvalOptions(dataset);
        for (var key in data) {
            if (!isLegalAttributeName(key)) {
                throw new TexError_js_1.default('InvalidHTMLAttr', 'Invalid HTML attribute: %1', "data-".concat(key));
            }
            NodeUtil_js_1.default.setAttribute(arg, "data-".concat(key), data[key]);
        }
        parser.Push(arg);
    },
    Href: function (parser, name) {
        var url = parser.GetArgument(name);
        var arg = GetArgumentMML(parser, name);
        NodeUtil_js_1.default.setAttribute(arg, 'href', url);
        parser.Push(arg);
    },
    Class: function (parser, name) {
        var CLASS = parser.GetArgument(name);
        var arg = GetArgumentMML(parser, name);
        var oldClass = NodeUtil_js_1.default.getAttribute(arg, 'class');
        if (oldClass) {
            CLASS = oldClass + ' ' + CLASS;
        }
        NodeUtil_js_1.default.setAttribute(arg, 'class', CLASS);
        parser.Push(arg);
    },
    Style: function (parser, name) {
        var style = parser.GetArgument(name);
        var arg = GetArgumentMML(parser, name);
        var oldStyle = NodeUtil_js_1.default.getAttribute(arg, 'style');
        if (oldStyle) {
            if (oldStyle.charAt(style.length - 1) !== ';') {
                oldStyle += ';';
            }
            style = oldStyle + ' ' + style;
        }
        NodeUtil_js_1.default.setAttribute(arg, 'style', style);
        parser.Push(arg);
    },
    Id: function (parser, name) {
        var ID = parser.GetArgument(name);
        var arg = GetArgumentMML(parser, name);
        NodeUtil_js_1.default.setAttribute(arg, 'id', ID);
        parser.Push(arg);
    },
};
var GetArgumentMML = function (parser, name) {
    var arg = parser.ParseArg(name);
    if (!NodeUtil_js_1.default.isInferred(arg)) {
        return arg;
    }
    var mrow = parser.create('node', 'mrow');
    NodeUtil_js_1.default.copyChildren(arg, mrow);
    NodeUtil_js_1.default.copyAttributes(arg, mrow);
    return mrow;
};
exports.default = HtmlMethods;
//# sourceMappingURL=HtmlMethods.js.map