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
exports.SvgMunderover = exports.SvgMover = exports.SvgMunder = void 0;
var msubsup_js_1 = require("./msubsup.js");
var munderover_js_1 = require("../../common/Wrappers/munderover.js");
var munderover_js_2 = require("../../../core/MmlTree/MmlNodes/munderover.js");
exports.SvgMunder = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMunderMixin)(msubsup_js_1.SvgMsub);
    return _a = (function (_super) {
            __extends(SvgMunder, _super);
            function SvgMunder() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMunder.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toSVG.call(this, parents);
                    return;
                }
                var svg = this.standardSvgNodes(parents);
                var _b = __read([this.baseChild, this.scriptChild], 2), base = _b[0], script = _b[1];
                var _c = __read([base.getOuterBBox(), script.getOuterBBox()], 2), bbox = _c[0], sbox = _c[1];
                base.toSVG(svg);
                script.toSVG(svg);
                var delta = this.isLineBelow
                    ? 0
                    : this.getDelta(this.scriptChild, true);
                var v = this.getUnderKV(bbox, sbox)[1];
                var _d = __read(this.getDeltaW([bbox, sbox], [0, -delta]), 2), bx = _d[0], sx = _d[1];
                base.place(bx, 0);
                script.place(sx, v);
            };
            return SvgMunder;
        }(Base)),
        _a.kind = munderover_js_2.MmlMunder.prototype.kind,
        _a;
})();
exports.SvgMover = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMoverMixin)(msubsup_js_1.SvgMsup);
    return _a = (function (_super) {
            __extends(SvgMover, _super);
            function SvgMover() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMover.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toSVG.call(this, parents);
                    return;
                }
                var svg = this.standardSvgNodes(parents);
                var _b = __read([this.baseChild, this.scriptChild], 2), base = _b[0], script = _b[1];
                var _c = __read([base.getOuterBBox(), script.getOuterBBox()], 2), bbox = _c[0], sbox = _c[1];
                base.toSVG(svg);
                script.toSVG(svg);
                var delta = this.isLineAbove ? 0 : this.getDelta(this.scriptChild);
                var u = this.getOverKU(bbox, sbox)[1];
                var _d = __read(this.getDeltaW([bbox, sbox], [0, delta]), 2), bx = _d[0], sx = _d[1];
                base.place(bx, 0);
                script.place(sx, u);
            };
            return SvgMover;
        }(Base)),
        _a.kind = munderover_js_2.MmlMover.prototype.kind,
        _a;
})();
exports.SvgMunderover = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMunderoverMixin)(msubsup_js_1.SvgMsubsup);
    return _a = (function (_super) {
            __extends(SvgMunderover, _super);
            function SvgMunderover() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMunderover.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toSVG.call(this, parents);
                    return;
                }
                var svg = this.standardSvgNodes(parents);
                var _b = __read([
                    this.baseChild,
                    this.overChild,
                    this.underChild,
                ], 3), base = _b[0], over = _b[1], under = _b[2];
                var _c = __read([
                    base.getOuterBBox(),
                    over.getOuterBBox(),
                    under.getOuterBBox(),
                ], 3), bbox = _c[0], obox = _c[1], ubox = _c[2];
                base.toSVG(svg);
                under.toSVG(svg);
                over.toSVG(svg);
                var odelta = this.getDelta(this.overChild);
                var udelta = this.getDelta(this.underChild, true);
                var u = this.getOverKU(bbox, obox)[1];
                var v = this.getUnderKV(bbox, ubox)[1];
                var _d = __read(this.getDeltaW([bbox, ubox, obox], [0, this.isLineBelow ? 0 : -udelta, this.isLineAbove ? 0 : odelta]), 3), bx = _d[0], ux = _d[1], ox = _d[2];
                base.place(bx, 0);
                under.place(ux, v);
                over.place(ox, u);
            };
            return SvgMunderover;
        }(Base)),
        _a.kind = munderover_js_2.MmlMunderover.prototype.kind,
        _a;
})();
//# sourceMappingURL=munderover.js.map