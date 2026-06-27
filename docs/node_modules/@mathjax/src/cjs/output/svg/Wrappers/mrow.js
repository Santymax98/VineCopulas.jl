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
exports.SvgInferredMrow = exports.SvgMrow = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mrow_js_1 = require("../../common/Wrappers/mrow.js");
var mrow_js_2 = require("../../../core/MmlTree/MmlNodes/mrow.js");
exports.SvgMrow = (function () {
    var _a;
    var Base = (0, mrow_js_1.CommonMrowMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMrow, _super);
            function SvgMrow() {
                var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
                _this.linebreakCount = 0;
                return _this;
            }
            SvgMrow.prototype.toSVG = function (parents) {
                this.getBBox();
                var n = (this.linebreakCount = this.isStack ? 0 : this.breakCount);
                parents =
                    n || !this.node.isInferred
                        ? this.standardSvgNodes(parents)
                        : this.getSvgNodes(parents);
                this.addChildren(parents);
                if (n) {
                    this.placeLines(parents);
                }
            };
            SvgMrow.prototype.getSvgNodes = function (parents) {
                if (this.dh) {
                    var g = this.svg('g', {
                        transform: "translate(0 ".concat(this.fixed(this.dh), ")"),
                    });
                    parents = [this.adaptor.append(parents[0], g)];
                }
                this.dom = parents;
                return parents;
            };
            SvgMrow.prototype.placeLines = function (parents) {
                var e_1, _b;
                var _c;
                var lines = this.lineBBox;
                var display = this.jax.math.display;
                var y = this.dh;
                try {
                    for (var _d = __values(parents.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var k = _e.value;
                        var lbox = lines[k];
                        this.place(lbox.L || 0, y, parents[k]);
                        y -=
                            Math.max(0.25, lbox.d) +
                                (display ? lbox.lineLeading : 0) +
                                Math.max(0.75, ((_c = lines[k + 1]) === null || _c === void 0 ? void 0 : _c.h) || 0);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            SvgMrow.prototype.createSvgNodes = function (parents) {
                var n = this.linebreakCount;
                if (!n)
                    return _super.prototype.createSvgNodes.call(this, parents);
                var adaptor = this.adaptor;
                var def = this.node.isInferred
                    ? { 'data-mjx-linestack': true }
                    : { 'data-mml-node': this.node.kind };
                this.dom = [adaptor.append(parents[0], this.svg('g', def))];
                this.dom = [
                    adaptor.append(this.handleHref(parents)[0], this.dom[0]),
                ];
                var svg = Array(n);
                for (var i = 0; i <= n; i++) {
                    svg[i] = adaptor.append(this.dom[0], this.svg('g', { 'data-mjx-linebox': true, 'data-mjx-lineno': i }));
                }
                return svg;
            };
            SvgMrow.prototype.addChildren = function (parents) {
                var e_2, _b, e_3, _c;
                var x = 0;
                var i = 0;
                try {
                    for (var _d = __values(this.childNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var child = _e.value;
                        var n = child.breakCount;
                        child.toSVG(parents.slice(i, i + n + 1));
                        if (child.dom) {
                            var k = 0;
                            try {
                                for (var _f = (e_3 = void 0, __values(child.dom)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                    var dom = _g.value;
                                    if (dom) {
                                        var dx = k ? 0 : child.dx;
                                        var cbox = child.getLineBBox(k++);
                                        x += (cbox.L + dx) * cbox.rscale;
                                        this.place(x, 0, dom);
                                        x += (cbox.w + cbox.R - dx) * cbox.rscale;
                                    }
                                    if (n) {
                                        x = 0;
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            if (n) {
                                var cbox = child.getLineBBox(n);
                                x += (cbox.w + cbox.R) * cbox.rscale;
                            }
                        }
                        i += n;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
            return SvgMrow;
        }(Base)),
        _a.kind = mrow_js_2.MmlMrow.prototype.kind,
        _a;
})();
exports.SvgInferredMrow = (function () {
    var _a;
    var Base = (0, mrow_js_1.CommonInferredMrowMixin)(exports.SvgMrow);
    return _a = (function (_super) {
            __extends(SvgInferredMrowNTD, _super);
            function SvgInferredMrowNTD() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgInferredMrowNTD;
        }(Base)),
        _a.kind = mrow_js_2.MmlInferredMrow.prototype.kind,
        _a;
})();
//# sourceMappingURL=mrow.js.map