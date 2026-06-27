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
exports.CommonScriptbaseMixin = CommonScriptbaseMixin;
var LineBBox_js_1 = require("../LineBBox.js");
var FontData_js_1 = require("../FontData.js");
function CommonScriptbaseMixin(Base) {
    var _a;
    return _a = (function (_super) {
            __extends(CommonScriptbaseMixin, _super);
            function CommonScriptbaseMixin(factory, node, parent) {
                if (parent === void 0) { parent = null; }
                var _this = _super.call(this, factory, node, parent) || this;
                _this.baseScale = 1;
                _this.baseIc = 0;
                _this.baseRemoveIc = false;
                _this.baseIsChar = false;
                _this.baseHasAccentOver = null;
                _this.baseHasAccentUnder = null;
                _this.isLineAbove = false;
                _this.isLineBelow = false;
                _this.isMathAccent = false;
                var core = (_this.baseCore = _this.getBaseCore());
                if (!core)
                    return _this;
                _this.setBaseAccentsFor(core);
                _this.baseScale = _this.getBaseScale();
                _this.baseIc = _this.getBaseIc();
                _this.baseIsChar = _this.isCharBase();
                _this.isMathAccent =
                    _this.baseIsChar &&
                        _this.scriptChild &&
                        _this.scriptChild.coreMO().node.getProperty('mathaccent') !== undefined;
                _this.checkLineAccents();
                _this.baseRemoveIc =
                    !_this.isLineAbove &&
                        !_this.isLineBelow &&
                        (!(_this.constructor
                            .useIC) ||
                            _this.isMathAccent);
                return _this;
            }
            Object.defineProperty(CommonScriptbaseMixin.prototype, "baseChild", {
                get: function () {
                    return this.childNodes[this.node.base];
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CommonScriptbaseMixin.prototype, "scriptChild", {
                get: function () {
                    return this.childNodes[1];
                },
                enumerable: false,
                configurable: true
            });
            CommonScriptbaseMixin.prototype.getBaseCore = function () {
                var core = this.getSemanticBase() || this.childNodes[0];
                var node = core === null || core === void 0 ? void 0 : core.node;
                while (core &&
                    ((core.childNodes.length === 1 &&
                        (node.isKind('mrow') ||
                            node.isKind('TeXAtom') ||
                            node.isKind('mstyle') ||
                            (node.isKind('mpadded') && !node.getProperty('vbox')) ||
                            node.isKind('mphantom') ||
                            node.isKind('semantics'))) ||
                        (node.isKind('munderover') &&
                            core.isMathAccent))) {
                    this.setBaseAccentsFor(core);
                    core = core.childNodes[0];
                    node = core === null || core === void 0 ? void 0 : core.node;
                }
                if (!core) {
                    this.baseHasAccentOver = this.baseHasAccentUnder = false;
                }
                return core || this.childNodes[0];
            };
            CommonScriptbaseMixin.prototype.setBaseAccentsFor = function (core) {
                if (core.node.isKind('munderover')) {
                    if (this.baseHasAccentOver === null) {
                        this.baseHasAccentOver = !!core.node.attributes.get('accent');
                    }
                    if (this.baseHasAccentUnder === null) {
                        this.baseHasAccentUnder = !!core.node.attributes.get('accentunder');
                    }
                }
            };
            CommonScriptbaseMixin.prototype.getSemanticBase = function () {
                var fence = this.node.attributes.getExplicit('data-semantic-fencepointer');
                return this.getBaseFence(this.baseChild, fence);
            };
            CommonScriptbaseMixin.prototype.getBaseFence = function (fence, id) {
                var e_1, _b;
                if (!fence || !fence.node.attributes || !id) {
                    return null;
                }
                if (fence.node.attributes.getExplicit('data-semantic-id') === id) {
                    return fence;
                }
                try {
                    for (var _c = __values(fence.childNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var child = _d.value;
                        var result = this.getBaseFence(child, id);
                        if (result) {
                            return result;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return null;
            };
            CommonScriptbaseMixin.prototype.getBaseScale = function () {
                var child = this.baseCore;
                var scale = 1;
                while (child && child !== this) {
                    var bbox = child.getOuterBBox();
                    scale *= bbox.rscale;
                    child = child.parent;
                }
                return scale;
            };
            CommonScriptbaseMixin.prototype.getBaseIc = function () {
                return this.baseCore.getOuterBBox().ic * this.baseScale;
            };
            CommonScriptbaseMixin.prototype.getAdjustedIc = function () {
                return this.baseIc ? 1.05 * this.baseIc + 0.05 : 0;
            };
            CommonScriptbaseMixin.prototype.isCharBase = function () {
                var base = this.baseCore;
                return (((base.node.isKind('mo') && base.size === null) ||
                    base.node.isKind('mi') ||
                    base.node.isKind('mn')) &&
                    base.bbox.rscale === 1 &&
                    Array.from(base.getText()).length === 1);
            };
            CommonScriptbaseMixin.prototype.checkLineAccents = function () {
                if (!this.node.isKind('munderover'))
                    return;
                if (this.node.isKind('mover')) {
                    this.isLineAbove = this.isLineAccent(this.scriptChild);
                }
                else if (this.node.isKind('munder')) {
                    this.isLineBelow = this.isLineAccent(this.scriptChild);
                }
                else {
                    var mml = this;
                    this.isLineAbove = this.isLineAccent(mml.overChild);
                    this.isLineBelow = this.isLineAccent(mml.underChild);
                }
            };
            CommonScriptbaseMixin.prototype.isLineAccent = function (script) {
                var node = script.coreMO().node;
                return node.isToken && node.getText() === '\u2015';
            };
            CommonScriptbaseMixin.prototype.getBaseWidth = function () {
                var bbox = this.baseChild.getLineBBox(this.baseChild.breakCount);
                return (bbox.w * bbox.rscale -
                    (this.baseRemoveIc ? this.baseIc : 0) +
                    this.font.params.extra_ic);
            };
            CommonScriptbaseMixin.prototype.getOffset = function () {
                return [0, 0];
            };
            CommonScriptbaseMixin.prototype.baseCharZero = function (n) {
                var largeop = !!this.baseCore.node.attributes.get('largeop');
                var sized = !!(this.baseCore.node.isKind('mo') &&
                    this.baseCore.size);
                var scale = this.baseScale;
                return this.baseIsChar && !largeop && !sized && scale === 1 ? 0 : n;
            };
            CommonScriptbaseMixin.prototype.getV = function () {
                var base = this.baseCore;
                var bbox = base.getLineBBox(base.breakCount);
                var sbox = this.scriptChild.getOuterBBox();
                var tex = this.font.params;
                var subscriptshift = this.length2em(this.node.attributes.get('subscriptshift'), tex.sub1);
                return Math.max(this.baseCharZero(bbox.d * this.baseScale + tex.sub_drop * sbox.rscale), subscriptshift, sbox.h * sbox.rscale - (4 / 5) * tex.x_height);
            };
            CommonScriptbaseMixin.prototype.getU = function () {
                var base = this.baseCore;
                var bbox = base.getLineBBox(base.breakCount);
                var sbox = this.scriptChild.getOuterBBox();
                var tex = this.font.params;
                var attr = this.node.attributes.getList('displaystyle', 'superscriptshift');
                var prime = this.node.getProperty('texprimestyle');
                var p = prime ? tex.sup3 : attr.displaystyle ? tex.sup1 : tex.sup2;
                var superscriptshift = this.length2em(attr.superscriptshift, p);
                return Math.max(this.baseCharZero(bbox.h * this.baseScale - tex.sup_drop * sbox.rscale), superscriptshift, sbox.d * sbox.rscale + (1 / 4) * tex.x_height);
            };
            CommonScriptbaseMixin.prototype.hasMovableLimits = function () {
                var display = this.node.attributes.get('displaystyle');
                var mo = this.baseChild.coreMO().node;
                return !display && !!mo.attributes.get('movablelimits');
            };
            CommonScriptbaseMixin.prototype.getOverKU = function (basebox, overbox) {
                var accent = this.node.attributes.get('accent');
                var tex = this.font.params;
                var d = overbox.d * overbox.rscale;
                var t = tex.rule_thickness * tex.separation_factor;
                var delta = this.baseHasAccentOver ? t : 0;
                var T = this.isLineAbove ? 3 * tex.rule_thickness : t;
                var k = (accent
                    ? T
                    : Math.max(tex.big_op_spacing1, tex.big_op_spacing3 - Math.max(0, d))) - delta;
                return [k, basebox.h * basebox.rscale + k + d];
            };
            CommonScriptbaseMixin.prototype.getUnderKV = function (basebox, underbox) {
                var accent = this.node.attributes.get('accentunder');
                var tex = this.font.params;
                var h = underbox.h * underbox.rscale;
                var t = tex.rule_thickness * tex.separation_factor;
                var delta = this.baseHasAccentUnder ? t : 0;
                var T = this.isLineBelow ? 3 * tex.rule_thickness : t;
                var k = (accent ? T : Math.max(tex.big_op_spacing2, tex.big_op_spacing4 - h)) -
                    delta;
                return [k, -(basebox.d * basebox.rscale + k + h)];
            };
            CommonScriptbaseMixin.prototype.getDeltaW = function (boxes, delta) {
                var e_2, _b, e_3, _c;
                if (delta === void 0) { delta = [0, 0, 0]; }
                var align = this.node.attributes.get('align');
                var widths = boxes.map(function (box) { return box.w * box.rscale; });
                widths[0] -=
                    this.baseRemoveIc && !this.baseCore.node.attributes.get('largeop')
                        ? this.baseIc
                        : 0;
                var w = Math.max.apply(Math, __spreadArray([], __read(widths), false));
                var dw = [];
                var m = 0;
                try {
                    for (var _d = __values(widths.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var i = _e.value;
                        dw[i] =
                            (align === 'center'
                                ? (w - widths[i]) / 2
                                : align === 'right'
                                    ? w - widths[i]
                                    : 0) + delta[i];
                        if (dw[i] < m) {
                            m = -dw[i];
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (m) {
                    try {
                        for (var _f = __values(dw.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var i = _g.value;
                            dw[i] += m;
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                [1, 2].map(function (i) { return (dw[i] += boxes[i] ? boxes[i].dx * boxes[0].rscale : 0); });
                return dw;
            };
            CommonScriptbaseMixin.prototype.getDelta = function (script, noskew) {
                if (noskew === void 0) { noskew = false; }
                var accent = this.node.attributes.get('accent');
                var _b = this.baseCore.getOuterBBox(), sk = _b.sk, ic = _b.ic;
                if (accent) {
                    sk -= script.getOuterBBox().sk;
                }
                return (((accent && !noskew ? sk : 0) + this.font.skewIcFactor * ic) *
                    this.baseScale);
            };
            CommonScriptbaseMixin.prototype.stretchChildren = function () {
                var e_4, _b, e_5, _c, e_6, _d;
                var stretchy = [];
                try {
                    for (var _e = __values(this.childNodes), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var child = _f.value;
                        if (child.canStretch(FontData_js_1.DIRECTION.Horizontal)) {
                            stretchy.push(child);
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                var count = stretchy.length;
                var nodeCount = this.childNodes.length;
                if (count && nodeCount > 1) {
                    var W = 0;
                    var all = count > 1 && count === nodeCount;
                    try {
                        for (var _g = __values(this.childNodes), _h = _g.next(); !_h.done; _h = _g.next()) {
                            var child = _h.value;
                            var noStretch = child.stretch.dir === FontData_js_1.DIRECTION.None;
                            if (all || noStretch) {
                                var _j = child.getOuterBBox(noStretch), w = _j.w, rscale = _j.rscale;
                                if (w * rscale > W)
                                    W = w * rscale;
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    try {
                        for (var stretchy_1 = __values(stretchy), stretchy_1_1 = stretchy_1.next(); !stretchy_1_1.done; stretchy_1_1 = stretchy_1.next()) {
                            var child = stretchy_1_1.value;
                            var core = child.coreMO();
                            if (core.size === null) {
                                core.getStretchedVariant([W / child.coreRScale()]);
                            }
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (stretchy_1_1 && !stretchy_1_1.done && (_d = stretchy_1.return)) _d.call(stretchy_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            };
            CommonScriptbaseMixin.prototype.computeBBox = function (bbox, recompute) {
                if (recompute === void 0) { recompute = false; }
                bbox.empty();
                bbox.append(this.baseChild.getOuterBBox());
                this.appendScripts(bbox);
                bbox.clean();
                this.setChildPWidths(recompute);
            };
            CommonScriptbaseMixin.prototype.appendScripts = function (bbox) {
                var w = this.getBaseWidth();
                var _b = __read(this.getOffset(), 2), x = _b[0], y = _b[1];
                bbox.combine(this.scriptChild.getOuterBBox(), w + x, y);
                bbox.w += this.font.params.scriptspace;
                return bbox;
            };
            Object.defineProperty(CommonScriptbaseMixin.prototype, "breakCount", {
                get: function () {
                    if (this._breakCount < 0) {
                        this._breakCount = this.node.isEmbellished
                            ? this.coreMO().embellishedBreakCount
                            : !this.node.linebreakContainer
                                ? this.childNodes[0].breakCount
                                : 0;
                    }
                    return this._breakCount;
                },
                enumerable: false,
                configurable: true
            });
            CommonScriptbaseMixin.prototype.breakTop = function (mrow, child) {
                return this.node.linebreakContainer ||
                    !this.parent ||
                    this.node.childIndex(child.node)
                    ? mrow
                    : this.parent.breakTop(mrow, this);
            };
            CommonScriptbaseMixin.prototype.computeLineBBox = function (i) {
                var n = this.breakCount;
                if (!n)
                    return LineBBox_js_1.LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
                var bbox = this.baseChild.getLineBBox(i).copy();
                if (i < n) {
                    if (i === 0) {
                        this.addLeftBorders(bbox);
                    }
                    this.addMiddleBorders(bbox);
                }
                else {
                    this.appendScripts(bbox);
                    this.addMiddleBorders(bbox);
                    this.addRightBorders(bbox);
                }
                return bbox;
            };
            return CommonScriptbaseMixin;
        }(Base)),
        _a.useIC = true,
        _a;
}
//# sourceMappingURL=scriptbase.js.map