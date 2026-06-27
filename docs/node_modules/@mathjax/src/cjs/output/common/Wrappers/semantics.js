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
exports.CommonSemanticsMixin = CommonSemanticsMixin;
function CommonSemanticsMixin(Base) {
    return (function (_super) {
        __extends(CommonSemanticsMixin, _super);
        function CommonSemanticsMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommonSemanticsMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            if (this.childNodes.length) {
                var _a = this.childNodes[0].getBBox(), w = _a.w, h = _a.h, d = _a.d;
                bbox.w = w;
                bbox.h = h;
                bbox.d = d;
            }
        };
        Object.defineProperty(CommonSemanticsMixin.prototype, "breakCount", {
            get: function () {
                return this.node.isEmbellished
                    ? this.coreMO().embellishedBreakCount
                    : this.childNodes[0].breakCount;
            },
            enumerable: false,
            configurable: true
        });
        return CommonSemanticsMixin;
    }(Base));
}
//# sourceMappingURL=semantics.js.map