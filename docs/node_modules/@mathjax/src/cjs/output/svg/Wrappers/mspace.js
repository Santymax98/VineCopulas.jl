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
exports.SvgMspace = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mspace_js_1 = require("../../common/Wrappers/mspace.js");
var mspace_js_2 = require("../../../core/MmlTree/MmlNodes/mspace.js");
exports.SvgMspace = (function () {
    var _a;
    var Base = (0, mspace_js_1.CommonMspaceMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMspace, _super);
            function SvgMspace() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgMspace;
        }(Base)),
        _a.kind = mspace_js_2.MmlMspace.prototype.kind,
        _a;
})();
//# sourceMappingURL=mspace.js.map