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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMfencedMixin = CommonMfencedMixin;
function CommonMfencedMixin(Base) {
    return (function (_super) {
        __extends(CommonMfencedMixin, _super);
        function CommonMfencedMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            _this.mrow = null;
            _this.createMrow();
            _this.addMrowChildren();
            return _this;
        }
        CommonMfencedMixin.prototype.createMrow = function () {
            var mmlFactory = this.node.factory;
            var mrow = mmlFactory.create('inferredMrow');
            mrow.inheritAttributesFrom(this.node);
            this.mrow = this.wrap(mrow);
            this.mrow.parent = this;
        };
        CommonMfencedMixin.prototype.addMrowChildren = function () {
            var e_1, _a;
            var mfenced = this.node;
            var mrow = this.mrow;
            this.addMo(mfenced.open);
            if (this.childNodes.length) {
                mrow.childNodes.push(this.childNodes[0]);
            }
            var i = 0;
            try {
                for (var _b = __values(this.childNodes.slice(1)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    this.addMo(mfenced.separators[i++]);
                    mrow.childNodes.push(child);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.addMo(mfenced.close);
            mrow.stretchChildren();
        };
        CommonMfencedMixin.prototype.addMo = function (node) {
            if (!node)
                return;
            var mo = this.wrap(node);
            this.mrow.childNodes.push(mo);
            mo.parent = this.mrow;
        };
        CommonMfencedMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            bbox.updateFrom(this.mrow.getOuterBBox());
            this.setChildPWidths(recompute);
        };
        Object.defineProperty(CommonMfencedMixin.prototype, "breakCount", {
            get: function () {
                return this.mrow.breakCount;
            },
            enumerable: false,
            configurable: true
        });
        CommonMfencedMixin.prototype.computeLineBBox = function (i) {
            return this.mrow.getLineBBox(i);
        };
        return CommonMfencedMixin;
    }(Base));
}
//# sourceMappingURL=mfenced.js.map