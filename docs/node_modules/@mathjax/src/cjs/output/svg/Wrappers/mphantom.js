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
exports.SvgMphantom = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mphantom_js_1 = require("../../../core/MmlTree/MmlNodes/mphantom.js");
exports.SvgMphantom = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(SvgMphantom, _super);
            function SvgMphantom() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMphantom.prototype.toSVG = function (parents) {
                this.standardSvgNodes(parents);
            };
            return SvgMphantom;
        }(Wrapper_js_1.SvgWrapper)),
        _a.kind = mphantom_js_1.MmlMphantom.prototype.kind,
        _a;
})();
//# sourceMappingURL=mphantom.js.map