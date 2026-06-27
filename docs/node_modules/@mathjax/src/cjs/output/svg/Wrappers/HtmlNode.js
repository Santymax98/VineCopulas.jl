"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgHtmlNode = void 0;
var semantics_js_1 = require("./semantics.js");
var HtmlNode_js_1 = require("../../../core/MmlTree/MmlNodes/HtmlNode.js");
exports.SvgHtmlNode = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(SvgHtmlNode, _super);
            function SvgHtmlNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgHtmlNode;
        }(semantics_js_1.SvgXmlNode)),
        _a.kind = HtmlNode_js_1.HtmlNode.prototype.kind,
        _a;
})();
//# sourceMappingURL=HtmlNode.js.map