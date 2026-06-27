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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMunderMixin = CommonMunderMixin;
exports.CommonMoverMixin = CommonMoverMixin;
exports.CommonMunderoverMixin = CommonMunderoverMixin;
function CommonMunderMixin(Base) {
    return (function (_super) {
        __extends(CommonMunderMixin, _super);
        function CommonMunderMixin() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, __spreadArray([], __read(args), false)) || this;
            _this.stretchChildren();
            return _this;
        }
        Object.defineProperty(CommonMunderMixin.prototype, "scriptChild", {
            get: function () {
                return this.childNodes[this.node.under];
            },
            enumerable: false,
            configurable: true
        });
        CommonMunderMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            if (this.hasMovableLimits()) {
                _super.prototype.computeBBox.call(this, bbox, recompute);
                return;
            }
            bbox.empty();
            var basebox = this.baseChild.getOuterBBox();
            var underbox = this.scriptChild.getOuterBBox();
            var v = this.getUnderKV(basebox, underbox)[1];
            var delta = this.isLineBelow
                ? 0
                : this.getDelta(this.scriptChild, true);
            var _a = __read(this.getDeltaW([basebox, underbox], [0, -delta]), 2), bw = _a[0], uw = _a[1];
            bbox.combine(basebox, bw, 0);
            bbox.combine(underbox, uw, v);
            bbox.d += this.font.params.big_op_spacing5;
            bbox.clean();
            this.setChildPWidths(recompute);
        };
        return CommonMunderMixin;
    }(Base));
}
function CommonMoverMixin(Base) {
    return (function (_super) {
        __extends(CommonMoverMixin, _super);
        function CommonMoverMixin() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, __spreadArray([], __read(args), false)) || this;
            _this.stretchChildren();
            return _this;
        }
        Object.defineProperty(CommonMoverMixin.prototype, "scriptChild", {
            get: function () {
                return this.childNodes[this.node.over];
            },
            enumerable: false,
            configurable: true
        });
        CommonMoverMixin.prototype.computeBBox = function (bbox) {
            if (this.hasMovableLimits()) {
                _super.prototype.computeBBox.call(this, bbox);
                return;
            }
            bbox.empty();
            var basebox = this.baseChild.getOuterBBox();
            var overbox = this.scriptChild.getOuterBBox();
            if (this.node.attributes.get('accent')) {
                basebox.h = Math.max(basebox.h, this.font.params.x_height * this.baseScale);
            }
            var u = this.getOverKU(basebox, overbox)[1];
            var delta = this.isLineAbove ? 0 : this.getDelta(this.scriptChild);
            var _a = __read(this.getDeltaW([basebox, overbox], [0, delta]), 2), bw = _a[0], ow = _a[1];
            bbox.combine(basebox, bw, 0);
            bbox.combine(overbox, ow, u);
            bbox.h += this.font.params.big_op_spacing5;
            bbox.clean();
        };
        return CommonMoverMixin;
    }(Base));
}
function CommonMunderoverMixin(Base) {
    return (function (_super) {
        __extends(CommonMunderoverMixin, _super);
        function CommonMunderoverMixin() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, __spreadArray([], __read(args), false)) || this;
            _this.stretchChildren();
            return _this;
        }
        Object.defineProperty(CommonMunderoverMixin.prototype, "underChild", {
            get: function () {
                return this.childNodes[this.node.under];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMunderoverMixin.prototype, "overChild", {
            get: function () {
                return this.childNodes[this.node.over];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMunderoverMixin.prototype, "subChild", {
            get: function () {
                return this.underChild;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMunderoverMixin.prototype, "supChild", {
            get: function () {
                return this.overChild;
            },
            enumerable: false,
            configurable: true
        });
        CommonMunderoverMixin.prototype.computeBBox = function (bbox) {
            if (this.hasMovableLimits()) {
                _super.prototype.computeBBox.call(this, bbox);
                return;
            }
            bbox.empty();
            var overbox = this.overChild.getOuterBBox();
            var basebox = this.baseChild.getOuterBBox();
            var underbox = this.underChild.getOuterBBox();
            if (this.node.attributes.get('accent')) {
                basebox.h = Math.max(basebox.h, this.font.params.x_height * this.baseScale);
            }
            var u = this.getOverKU(basebox, overbox)[1];
            var v = this.getUnderKV(basebox, underbox)[1];
            var odelta = this.getDelta(this.overChild);
            var udelta = this.getDelta(this.underChild, true);
            var _a = __read(this.getDeltaW([basebox, underbox, overbox], [0, this.isLineBelow ? 0 : -udelta, this.isLineAbove ? 0 : odelta]), 3), bw = _a[0], uw = _a[1], ow = _a[2];
            bbox.combine(basebox, bw, 0);
            bbox.combine(overbox, ow, u);
            bbox.combine(underbox, uw, v);
            var z = this.font.params.big_op_spacing5;
            bbox.h += z;
            bbox.d += z;
            bbox.clean();
        };
        return CommonMunderoverMixin;
    }(Base));
}
//# sourceMappingURL=munderover.js.map