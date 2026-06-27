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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMsqrtMixin = CommonMsqrtMixin;
var BBox_js_1 = require("../../../util/BBox.js");
var FontData_js_1 = require("../FontData.js");
function CommonMsqrtMixin(Base) {
    return (function (_super) {
        __extends(CommonMsqrtMixin, _super);
        function CommonMsqrtMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            _this.surd = _this.createMo('\u221A');
            _this.surd.canStretch(FontData_js_1.DIRECTION.Vertical);
            _this.getStretchedSurd();
            return _this;
        }
        Object.defineProperty(CommonMsqrtMixin.prototype, "base", {
            get: function () {
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMsqrtMixin.prototype, "root", {
            get: function () {
                return null;
            },
            enumerable: false,
            configurable: true
        });
        CommonMsqrtMixin.prototype.combineRootBBox = function (_bbox, _sbox, _H) { };
        CommonMsqrtMixin.prototype.getPQ = function (sbox) {
            var t = this.font.params.rule_thickness;
            var s = this.font.params.surd_height;
            var p = this.node.attributes.get('displaystyle')
                ? this.font.params.x_height
                : t;
            var q = sbox.h + sbox.d > this.surdH
                ? (sbox.h + sbox.d - (this.surdH - t - s - p / 2)) / 2
                : s + p / 4;
            return [p, q];
        };
        CommonMsqrtMixin.prototype.getRootDimens = function (_sbox, _H) {
            return [0, 0, 0, 0];
        };
        CommonMsqrtMixin.prototype.rootWidth = function () {
            return 1.25;
        };
        CommonMsqrtMixin.prototype.getStretchedSurd = function () {
            var t = this.font.params.rule_thickness;
            var s = this.font.params.surd_height;
            var p = this.node.attributes.get('displaystyle')
                ? this.font.params.x_height
                : t;
            var _a = this.childNodes[this.base].getOuterBBox(), h = _a.h, d = _a.d;
            this.surdH = h + d + t + s + p / 4;
            this.surd.getStretchedVariant([this.surdH - d, d], true);
        };
        CommonMsqrtMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            bbox.empty();
            var surdbox = this.surd.getBBox();
            var basebox = new BBox_js_1.BBox(this.childNodes[this.base].getOuterBBox());
            var q = this.getPQ(surdbox)[1];
            var t = this.font.params.rule_thickness;
            var s = this.font.params.surd_height;
            var H = basebox.h + q + t;
            var _a = __read(this.getRootDimens(surdbox, H), 1), x = _a[0];
            bbox.h = H + s;
            this.combineRootBBox(bbox, surdbox, H);
            bbox.combine(surdbox, x, H - surdbox.h);
            bbox.combine(basebox, x + surdbox.w, 0);
            bbox.clean();
            this.setChildPWidths(recompute);
        };
        CommonMsqrtMixin.prototype.invalidateBBox = function () {
            _super.prototype.invalidateBBox.call(this);
            this.surd.childNodes[0].invalidateBBox();
        };
        return CommonMsqrtMixin;
    }(Base));
}
//# sourceMappingURL=msqrt.js.map