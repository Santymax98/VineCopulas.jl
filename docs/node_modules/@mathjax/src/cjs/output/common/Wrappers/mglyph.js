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
exports.CommonMglyphMixin = CommonMglyphMixin;
function CommonMglyphMixin(Base) {
    return (function (_super) {
        __extends(CommonMglyphMixin, _super);
        function CommonMglyphMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            _this.getParameters();
            return _this;
        }
        CommonMglyphMixin.prototype.getParameters = function () {
            var _a = this.node.attributes.getList('width', 'height', 'valign', 'src', 'index'), width = _a.width, height = _a.height, valign = _a.valign, src = _a.src, index = _a.index;
            if (src) {
                this.width = width === 'auto' ? 1 : this.length2em(width);
                this.height = height === 'auto' ? 1 : this.length2em(height);
                this.valign = this.length2em(valign || '0');
            }
            else {
                var text = String.fromCodePoint(parseInt(index));
                var mmlFactory = this.node.factory;
                this.charWrapper = this.wrap(mmlFactory.create('text').setText(text));
                this.charWrapper.parent = this;
            }
        };
        CommonMglyphMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            if (this.charWrapper) {
                bbox.updateFrom(this.charWrapper.getBBox());
            }
            else {
                bbox.w = this.width;
                bbox.h = this.height + this.valign;
                bbox.d = -this.valign;
            }
        };
        return CommonMglyphMixin;
    }(Base));
}
//# sourceMappingURL=mglyph.js.map