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
exports.CommonMsubMixin = CommonMsubMixin;
exports.CommonMsupMixin = CommonMsupMixin;
exports.CommonMsubsupMixin = CommonMsubsupMixin;
function CommonMsubMixin(Base) {
    var _a;
    return _a = (function (_super) {
            __extends(CommonMsubMixin, _super);
            function CommonMsubMixin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(CommonMsubMixin.prototype, "scriptChild", {
                get: function () {
                    return this.childNodes[this.node.sub];
                },
                enumerable: false,
                configurable: true
            });
            CommonMsubMixin.prototype.getOffset = function () {
                var x = this.baseIsChar ? 0 : this.getAdjustedIc();
                return [x, -this.getV()];
            };
            return CommonMsubMixin;
        }(Base)),
        _a.useIC = false,
        _a;
}
function CommonMsupMixin(Base) {
    return (function (_super) {
        __extends(CommonMsupMixin, _super);
        function CommonMsupMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CommonMsupMixin.prototype, "scriptChild", {
            get: function () {
                return this.childNodes[this.node.sup];
            },
            enumerable: false,
            configurable: true
        });
        CommonMsupMixin.prototype.getOffset = function () {
            var x = this.getAdjustedIc() - (this.baseRemoveIc ? 0 : this.baseIc);
            return [x, this.getU()];
        };
        return CommonMsupMixin;
    }(Base));
}
function CommonMsubsupMixin(Base) {
    var _a;
    return _a = (function (_super) {
            __extends(CommonMsubsupMixin, _super);
            function CommonMsubsupMixin() {
                var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
                _this.UVQ = null;
                return _this;
            }
            Object.defineProperty(CommonMsubsupMixin.prototype, "subChild", {
                get: function () {
                    return this.childNodes[this.node.sub];
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CommonMsubsupMixin.prototype, "supChild", {
                get: function () {
                    return this.childNodes[this.node.sup];
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CommonMsubsupMixin.prototype, "scriptChild", {
                get: function () {
                    return this.supChild;
                },
                enumerable: false,
                configurable: true
            });
            CommonMsubsupMixin.prototype.getUVQ = function (subbox, supbox) {
                if (subbox === void 0) { subbox = this.subChild.getOuterBBox(); }
                if (supbox === void 0) { supbox = this.supChild.getOuterBBox(); }
                var base = this.baseCore;
                var bbox = base.getLineBBox(base.breakCount);
                if (this.UVQ)
                    return this.UVQ;
                var tex = this.font.params;
                var t = 3 * tex.rule_thickness;
                var subscriptshift = this.length2em(this.node.attributes.get('subscriptshift'), tex.sub2);
                var drop = this.baseCharZero(bbox.d * this.baseScale + tex.sub_drop * subbox.rscale);
                var supd = supbox.d * supbox.rscale;
                var subh = subbox.h * subbox.rscale;
                var _b = __read([this.getU(), Math.max(drop, subscriptshift)], 2), u = _b[0], v = _b[1];
                var q = u - supd - (subh - v);
                if (q < t) {
                    v += t - q;
                    var p = (4 / 5) * tex.x_height - (u - supd);
                    if (p > 0) {
                        u += p;
                        v -= p;
                    }
                }
                u = Math.max(this.length2em(this.node.attributes.get('superscriptshift'), u), u);
                v = Math.max(this.length2em(this.node.attributes.get('subscriptshift'), v), v);
                q = u - supd - (subh - v);
                this.UVQ = [u, -v, q];
                return this.UVQ;
            };
            CommonMsubsupMixin.prototype.appendScripts = function (bbox) {
                var _b = __read([
                    this.subChild.getOuterBBox(),
                    this.supChild.getOuterBBox(),
                ], 2), subbox = _b[0], supbox = _b[1];
                var w = this.getBaseWidth();
                var x = this.getAdjustedIc();
                var _c = __read(this.getUVQ(), 2), u = _c[0], v = _c[1];
                var y = bbox.d - this.baseChild.getLineBBox(this.baseChild.breakCount).d;
                bbox.combine(subbox, w + (this.baseIsChar ? 0 : x), v - y);
                bbox.combine(supbox, w + x, u - y);
                bbox.w += this.font.params.scriptspace;
                return bbox;
            };
            return CommonMsubsupMixin;
        }(Base)),
        _a.useIC = false,
        _a;
}
//# sourceMappingURL=msubsup.js.map