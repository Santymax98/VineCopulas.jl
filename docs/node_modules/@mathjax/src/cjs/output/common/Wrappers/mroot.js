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
exports.CommonMrootMixin = CommonMrootMixin;
function CommonMrootMixin(Base) {
    return (function (_super) {
        __extends(CommonMrootMixin, _super);
        function CommonMrootMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CommonMrootMixin.prototype, "root", {
            get: function () {
                return 1;
            },
            enumerable: false,
            configurable: true
        });
        CommonMrootMixin.prototype.combineRootBBox = function (BBOX, sbox, H) {
            var bbox = this.childNodes[this.root].getOuterBBox();
            var h = this.getRootDimens(sbox, H)[1];
            BBOX.combine(bbox, 0, h);
        };
        CommonMrootMixin.prototype.getRootDimens = function (sbox, H) {
            var surd = this.surd;
            var bbox = this.childNodes[this.root].getOuterBBox();
            var offset = (surd.size < 0 ? 0.5 : 0.6) * sbox.w;
            var w = bbox.w, rscale = bbox.rscale;
            var W = Math.max(w, offset / rscale);
            var dx = Math.max(0, W - w);
            var h = this.rootHeight(bbox, sbox, surd.size, H);
            var x = W * rscale - offset;
            return [x, h, dx];
        };
        CommonMrootMixin.prototype.rootHeight = function (rbox, sbox, size, H) {
            var h = sbox.h + sbox.d;
            var b = (size < 0 ? 1.9 : 0.55 * h) - (h - H);
            return b + Math.max(0, rbox.d * rbox.rscale);
        };
        CommonMrootMixin.prototype.rootWidth = function () {
            var bbox = this.childNodes[this.root].getOuterBBox();
            return 0.4 + bbox.w * bbox.rscale;
        };
        return CommonMrootMixin;
    }(Base));
}
//# sourceMappingURL=mroot.js.map