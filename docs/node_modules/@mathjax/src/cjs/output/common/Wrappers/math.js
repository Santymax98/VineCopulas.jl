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
exports.CommonMathMixin = CommonMathMixin;
function CommonMathMixin(Base) {
    return (function (_super) {
        __extends(CommonMathMixin, _super);
        function CommonMathMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommonMathMixin.prototype.getWrapWidth = function (_i) {
            return this.parent
                ? this.getBBox().w
                : this.metrics.containerWidth / this.jax.pxPerEm;
        };
        CommonMathMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            _super.prototype.computeBBox.call(this, bbox, recompute);
            var attributes = this.node.attributes;
            if (!this.parent &&
                this.jax.math.display &&
                attributes.get('overflow') === 'linebreak') {
                var W = this.containerWidth;
                if (bbox.w > W) {
                    this.childNodes[0].breakToWidth(W);
                }
                bbox.updateFrom(this.childNodes[0].getBBox());
            }
        };
        return CommonMathMixin;
    }(Base));
}
//# sourceMappingURL=math.js.map