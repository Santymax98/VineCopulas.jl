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
exports.SvgMi = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mi_js_1 = require("../../common/Wrappers/mi.js");
var mi_js_2 = require("../../../core/MmlTree/MmlNodes/mi.js");
exports.SvgMi = (function () {
    var _a;
    var Base = (0, mi_js_1.CommonMiMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMi, _super);
            function SvgMi() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgMi;
        }(Base)),
        _a.kind = mi_js_2.MmlMi.prototype.kind,
        _a;
})();
//# sourceMappingURL=mi.js.map