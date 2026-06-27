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
exports.LinebreakVisitor = exports.Linebreaks = exports.NOBREAK = void 0;
var Visitor_js_1 = require("../../core/Tree/Visitor.js");
var LineBBox_js_1 = require("./LineBBox.js");
var MmlNode_js_1 = require("../../core/MmlTree/MmlNode.js");
var OperatorDictionary_js_1 = require("../../core/MmlTree/OperatorDictionary.js");
exports.NOBREAK = 1000000;
var Linebreaks = (function (_super) {
    __extends(Linebreaks, _super);
    function Linebreaks() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Linebreaks.prototype.breakToWidth = function (_wrapper, _W) { };
    return Linebreaks;
}(Visitor_js_1.AbstractVisitor));
exports.Linebreaks = Linebreaks;
var LinebreakVisitor = (function (_super) {
    __extends(LinebreakVisitor, _super);
    function LinebreakVisitor() {
        var _a;
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.PENALTY = {
            newline: function (_p) { return 0; },
            nobreak: function (_p) { return exports.NOBREAK; },
            goodbreak: function (p) { return p - 200 * _this.state.depth; },
            badbreak: function (p) { return p + 200 * _this.state.depth; },
            auto: function (p) { return p; },
        };
        _this.FACTORS = {
            depth: function (p) { return p + 800 * _this.state.depth; },
            width: function (p) {
                return p +
                    Math.floor(((_this.state.width - _this.state.w) / _this.state.width) * 2500);
            },
            tail: function (p) {
                return p +
                    Math.floor((_this.state.width /
                        Math.max(0.0001, _this.state.mathLeft - _this.state.w)) *
                        500);
            },
            open: function (p, mo) {
                var prevClass = mo.node.prevClass;
                if (prevClass === MmlNode_js_1.TEXCLASS.BIN ||
                    prevClass === MmlNode_js_1.TEXCLASS.REL ||
                    prevClass === MmlNode_js_1.TEXCLASS.OP) {
                    return p + 5000;
                }
                var prev = _this.getPrevious(mo);
                if (prev &&
                    (prev.attributes.get('form') !== 'postfix' ||
                        prev.attributes.get('linebreak') === 'nobreak')) {
                    return p + 5000;
                }
                var parent = mo.node.Parent;
                if ((parent === null || parent === void 0 ? void 0 : parent.isKind('mmultiscripts')) &&
                    mo.node === _this.getFirstToken(parent)) {
                    var prescripts = !!parent.childNodes.filter(function (node) {
                        return node.isKind('mprescripts');
                    }).length;
                    if (prescripts)
                        return exports.NOBREAK;
                }
                return p - 500;
            },
            close: function (p, mo) {
                var _a;
                var parent = mo.node.Parent;
                if ((parent === null || parent === void 0 ? void 0 : parent.isKind('msubsup')) &&
                    !(parent.isKind('mmultiscripts') &&
                        ((_a = parent.childNodes[1]) === null || _a === void 0 ? void 0 : _a.isKind('mprescripts'))) &&
                    mo.node === _this.getLastToken(parent.childNodes[0])) {
                    return exports.NOBREAK;
                }
                return p + 500;
            },
            space: function (p, node) {
                var mspace = node;
                if (!mspace.canBreak)
                    return exports.NOBREAK;
                var w = mspace.getBBox().w;
                return w < 0 ? exports.NOBREAK : w < 1 ? p : p - 100 * (w + 4);
            },
            separator: function (p) { return p + 500; },
            fuzz: function (p) { return p * 0.99; },
        };
        _this.TEXCLASS = (_a = {},
            _a[MmlNode_js_1.TEXCLASS.BIN] = function (p) { return p - 250; },
            _a[MmlNode_js_1.TEXCLASS.REL] = function (p) { return p - 500; },
            _a);
        return _this;
    }
    LinebreakVisitor.prototype.breakToWidth = function (wrapper, W) {
        var e_1, _a;
        var state = this.state;
        this.state = this.createState(wrapper);
        this.state.width = W;
        var n = wrapper.breakCount;
        for (var i = 0; i <= n; i++) {
            var line = wrapper.lineBBox[i] || wrapper.getLineBBox(i);
            if (line.w > W) {
                this.breakLineToWidth(wrapper, i);
            }
        }
        try {
            for (var _b = __values(this.state.breaks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), ww = _d[0], ij = _d[1];
                if (ij === null) {
                    var mo = ww.coreMO();
                    mo.setBreakStyle(mo.node.attributes.get('linebreakstyle') || 'before');
                }
                else {
                    ww.setBreakAt(ij);
                }
                ww.invalidateBBox();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.state = state;
    };
    LinebreakVisitor.prototype.createState = function (wrapper) {
        var mathWidth = wrapper.getBBox().w;
        return {
            breaks: new Set(),
            potential: [],
            width: 0,
            w: 0,
            prevWidth: 0,
            prevBreak: null,
            depth: 0,
            mathWidth: mathWidth,
            mathLeft: mathWidth,
        };
    };
    LinebreakVisitor.prototype.breakLineToWidth = function (wrapper, i) {
        var state = this.state;
        state.potential = [];
        state.w = 0;
        state.prevWidth = 0;
        state.prevBreak = null;
        state.depth = 0;
        this.visitNode(wrapper, i);
    };
    LinebreakVisitor.prototype.addWidth = function (bbox, w) {
        if (w === void 0) { w = null; }
        if (w === null) {
            w = bbox.L + bbox.w + bbox.R;
        }
        if (!w)
            return;
        w *= bbox.rscale;
        this.state.w += w;
        if (this.state.potential.length) {
            this.state.potential[0][4] += w;
        }
        this.processBreak();
    };
    LinebreakVisitor.prototype.processBreak = function () {
        var state = this.state;
        var _loop_1 = function () {
            var br = state.potential.pop();
            var _a = __read(br, 5), ww = _a[0], pw = _a[2], dw = _a[3], w = _a[4];
            state.breaks.add(ww);
            state.w = state.potential.reduce(function (w, brk) { return w + brk[4]; }, dw + w);
            if (state.prevBreak && state.prevWidth + pw <= state.width) {
                state.breaks.delete(state.prevBreak[0]);
                state.prevWidth += pw;
            }
            else {
                state.prevWidth = pw + dw;
            }
            state.potential.forEach(function (data) { return (data[2] -= pw); });
            state.prevBreak = br;
            state.mathLeft -= pw;
        };
        while (state.potential.length && state.w > this.state.width) {
            _loop_1();
        }
    };
    LinebreakVisitor.prototype.pushBreak = function (wrapper, penalty, w, ij) {
        var _a;
        var state = this.state;
        if (penalty >= exports.NOBREAK || (state.w === 0 && state.prevWidth === 0))
            return;
        while (state.potential.length &&
            state.potential[0][1] > this.FACTORS.fuzz(penalty)) {
            var data = state.potential.shift();
            if (state.potential.length) {
                state.potential[0][4] += data[4];
            }
        }
        state.potential.unshift([
            [wrapper, ij],
            penalty,
            state.w - (((_a = state.prevBreak) === null || _a === void 0 ? void 0 : _a[3]) || 0),
            w,
            0,
        ]);
    };
    LinebreakVisitor.prototype.getBorderLR = function (wrapper) {
        var _a;
        var data = wrapper.styleData;
        if (!data)
            return [0, 0];
        var border = ((_a = data === null || data === void 0 ? void 0 : data.border) === null || _a === void 0 ? void 0 : _a.width) || [0, 0, 0, 0];
        var padding = (data === null || data === void 0 ? void 0 : data.padding) || [0, 0, 0, 0];
        return [border[3] + padding[3], border[1] + padding[1]];
    };
    LinebreakVisitor.prototype.getFirstToken = function (node) {
        return node.isToken ? node : this.getFirstToken(node.childNodes[0]);
    };
    LinebreakVisitor.prototype.getLastToken = function (node) {
        return node.isToken
            ? node
            : this.getLastToken(node.childNodes[node.childNodes.length - 1]);
    };
    LinebreakVisitor.prototype.visitNode = function (wrapper, i) {
        if (!wrapper)
            return;
        this.state.depth++;
        if (wrapper.node.isEmbellished && !wrapper.node.isKind('mo')) {
            this.visitEmbellishedOperator(wrapper, i);
        }
        else {
            _super.prototype.visitNode.call(this, wrapper, i);
        }
        this.state.depth--;
    };
    LinebreakVisitor.prototype.visitDefault = function (wrapper, i) {
        var _a;
        var bbox = wrapper.getLineBBox(i);
        if (wrapper.node.isToken ||
            wrapper.node.linebreakContainer ||
            !((_a = wrapper.childNodes) === null || _a === void 0 ? void 0 : _a[0])) {
            this.addWidth(bbox);
        }
        else {
            var _b = __read(this.getBorderLR(wrapper), 2), L = _b[0], R = _b[1];
            if (i === 0) {
                this.addWidth(bbox, bbox.L + L);
            }
            this.visitNode(wrapper.childNodes[0], i);
            if (i === wrapper.breakCount) {
                this.addWidth(bbox, bbox.R + R);
            }
        }
    };
    LinebreakVisitor.prototype.visitEmbellishedOperator = function (wrapper, _i) {
        var mo = wrapper.coreMO();
        var bbox = LineBBox_js_1.LineBBox.from(wrapper.getOuterBBox(), wrapper.linebreakOptions.lineleading);
        bbox.getIndentData(mo.node);
        var style = mo.getBreakStyle(mo.node.attributes.get('linebreakstyle'));
        var dw = mo.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
        var penalty = this.moPenalty(mo);
        if (style === 'before') {
            this.pushBreak(wrapper, penalty, dw - bbox.L, null);
            this.addWidth(bbox);
        }
        else {
            this.addWidth(bbox);
            var w = (style === 'after'
                ? 0
                : mo.multChar
                    ? mo.multChar.getBBox().w
                    : bbox.w) + dw;
            this.pushBreak(wrapper, penalty, w, null);
        }
    };
    LinebreakVisitor.prototype.visitMoNode = function (wrapper, _i) {
        var mo = wrapper;
        var bbox = LineBBox_js_1.LineBBox.from(mo.getOuterBBox(), mo.linebreakOptions.lineleading);
        bbox.getIndentData(mo.node);
        var style = mo.getBreakStyle(mo.node.attributes.get('linebreakstyle'));
        var dw = mo.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
        var penalty = this.moPenalty(mo);
        if (style === 'before') {
            this.pushBreak(wrapper, penalty, dw - bbox.L, null);
            this.addWidth(bbox);
        }
        else {
            this.addWidth(bbox);
            var w = (style === 'after'
                ? 0
                : mo.multChar
                    ? mo.multChar.getBBox().w
                    : bbox.w) + dw;
            this.pushBreak(wrapper, penalty, w, null);
        }
    };
    LinebreakVisitor.prototype.moPenalty = function (mo) {
        var _a = mo.node.attributes.getList('linebreak', 'fence', 'form'), linebreak = _a.linebreak, fence = _a.fence, form = _a.form;
        var FACTORS = this.FACTORS;
        var penalty = FACTORS.tail(FACTORS.width(0));
        var isOpen = (fence && form === 'prefix') || mo.node.texClass === MmlNode_js_1.TEXCLASS.OPEN;
        var isClose = (fence && form === 'postfix') || mo.node.texClass === MmlNode_js_1.TEXCLASS.CLOSE;
        if (isOpen) {
            penalty = FACTORS.open(penalty, mo);
            this.state.depth++;
        }
        if (isClose) {
            penalty = FACTORS.close(penalty, mo);
            this.state.depth--;
        }
        penalty = (this.TEXCLASS[mo.node.texClass] || (function (p) { return p; }))(penalty);
        return (this.PENALTY[linebreak] || (function (p) { return p; }))(FACTORS.depth(penalty));
    };
    LinebreakVisitor.prototype.getPrevious = function (mo) {
        var child = mo.node;
        var parent = child.parent;
        var i = parent.childIndex(child);
        while (parent && (parent.notParent || parent.isKind('mrow')) && i === 0) {
            child = parent;
            parent = child.parent;
            i = parent.childIndex(child);
        }
        if (!parent || !i)
            return null;
        var prev = parent.childNodes[i - 1];
        return prev.isEmbellished ? prev.coreMO() : null;
    };
    LinebreakVisitor.prototype.visitMspaceNode = function (wrapper, i) {
        var bbox = wrapper.getLineBBox(i);
        var mspace = wrapper;
        if (mspace.canBreak) {
            var penalty = this.mspacePenalty(mspace);
            bbox.getIndentData(wrapper.node);
            var dw = wrapper.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
            this.pushBreak(wrapper, penalty, dw - bbox.w, null);
        }
        this.addWidth(bbox);
    };
    LinebreakVisitor.prototype.mspacePenalty = function (mspace) {
        var linebreak = mspace.node.attributes.get('linebreak');
        var FACTORS = this.FACTORS;
        var penalty = FACTORS.space(FACTORS.tail(FACTORS.width(0)), mspace);
        return (this.PENALTY[linebreak] || (function (p) { return p; }))(FACTORS.depth(penalty));
    };
    LinebreakVisitor.prototype.visitMtextNode = function (wrapper, i) {
        var e_2, _a, e_3, _b;
        if (!wrapper.getText().match(/ /)) {
            this.visitDefault(wrapper, i);
            return;
        }
        var mtext = wrapper;
        mtext.clearBreakPoints();
        var space = mtext.textWidth(' ');
        var bbox = wrapper.getBBox();
        var _c = __read(this.getBorderLR(wrapper), 2), L = _c[0], R = _c[1];
        this.addWidth(bbox, bbox.L + L);
        var children = mtext.childNodes;
        try {
            for (var _d = __values(children.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var j = _e.value;
                var child = children[j];
                if (child.node.isKind('text')) {
                    var words = child.node.getText().split(/ /);
                    var last = words.pop();
                    try {
                        for (var _f = (e_3 = void 0, __values(words.keys())), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var k = _g.value;
                            this.addWidth(bbox, mtext.textWidth(words[k]));
                            this.pushBreak(wrapper, this.mtextPenalty(), -space, [j, k + 1]);
                            this.addWidth(bbox, space);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    this.addWidth(bbox, mtext.textWidth(last));
                }
                else {
                    this.addWidth(child.getBBox());
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.addWidth(bbox, bbox.R + R);
    };
    LinebreakVisitor.prototype.mtextPenalty = function () {
        var FACTORS = this.FACTORS;
        return FACTORS.depth(FACTORS.tail(FACTORS.width(0)));
    };
    LinebreakVisitor.prototype.visitMrowNode = function (wrapper, i) {
        var line = wrapper.lineBBox[i] || wrapper.getLineBBox(i);
        var _a = __read(line.start || [0, 0], 2), start = _a[0], startL = _a[1];
        var _b = __read(line.end || [wrapper.childNodes.length - 1, 0], 2), end = _b[0], endL = _b[1];
        var _c = __read(this.getBorderLR(wrapper), 2), L = _c[0], R = _c[1];
        this.addWidth(line, line.L + L);
        for (var i_1 = start; i_1 <= end; i_1++) {
            this.visitNode(wrapper.childNodes[i_1], i_1 === start ? startL : i_1 === end ? endL : 0);
        }
        this.addWidth(line, line.R + R);
    };
    LinebreakVisitor.prototype.visitInferredMrowNode = function (wrapper, i) {
        this.state.depth--;
        this.visitMrowNode(wrapper, i);
        this.state.depth++;
    };
    LinebreakVisitor.prototype.visitMfracNode = function (wrapper, i) {
        var mfrac = wrapper;
        if (!mfrac.node.attributes.get('bevelled') &&
            mfrac.getOuterBBox().w > this.state.width) {
            this.breakToWidth(mfrac.childNodes[0], this.state.width);
            this.breakToWidth(mfrac.childNodes[1], this.state.width);
        }
        this.visitDefault(wrapper, i);
    };
    LinebreakVisitor.prototype.visitMsqrtNode = function (wrapper, i) {
        if (wrapper.getOuterBBox().w > this.state.width) {
            var msqrt = wrapper;
            var base = msqrt.childNodes[msqrt.base];
            this.breakToWidth(base, this.state.width - msqrt.rootWidth());
            msqrt.getStretchedSurd();
        }
        this.visitDefault(wrapper, i);
    };
    LinebreakVisitor.prototype.visitMrootNode = function (wrapper, i) {
        this.visitMsqrtNode(wrapper, i);
    };
    LinebreakVisitor.prototype.visitMsubNode = function (wrapper, i) {
        this.visitDefault(wrapper, i);
        var msub = wrapper;
        var x = msub.getOffset()[0];
        var sbox = msub.scriptChild.getOuterBBox();
        var _a = __read(this.getBorderLR(wrapper), 2), L = _a[0], R = _a[1];
        this.addWidth(msub.getLineBBox(i), x + L + sbox.rscale * sbox.w + msub.font.params.scriptspace + R);
    };
    LinebreakVisitor.prototype.visitMsupNode = function (wrapper, i) {
        this.visitDefault(wrapper, i);
        var msup = wrapper;
        var x = msup.getOffset()[0];
        var sbox = msup.scriptChild.getOuterBBox();
        var _a = __read(this.getBorderLR(wrapper), 2), L = _a[0], R = _a[1];
        this.addWidth(msup.getLineBBox(i), x + L + sbox.rscale * sbox.w + msup.font.params.scriptspace + R);
    };
    LinebreakVisitor.prototype.visitMsubsupNode = function (wrapper, i) {
        this.visitDefault(wrapper, i);
        var msubsup = wrapper;
        var subbox = msubsup.subChild.getOuterBBox();
        var supbox = msubsup.supChild.getOuterBBox();
        var x = msubsup.getAdjustedIc();
        var w = Math.max(subbox.rscale * subbox.w, x + supbox.rscale * supbox.w) +
            msubsup.font.params.scriptspace;
        var _a = __read(this.getBorderLR(wrapper), 2), L = _a[0], R = _a[1];
        this.addWidth(wrapper.getLineBBox(i), L + w + R);
    };
    LinebreakVisitor.prototype.visitMmultiscriptsNode = function (wrapper, i) {
        var mmultiscripts = wrapper;
        var data = mmultiscripts.scriptData;
        if (data.numPrescripts) {
            var w = Math.max(data.psup.rscale * data.psup.w, data.psub.rscale * data.psub.w);
            this.addWidth(wrapper.getLineBBox(i), w + mmultiscripts.font.params.scriptspace);
        }
        this.visitDefault(wrapper, i);
        if (data.numScripts) {
            var w = Math.max(data.sup.rscale * data.sup.w, data.sub.rscale * data.sub.w);
            this.addWidth(wrapper.getLineBBox(i), w + mmultiscripts.font.params.scriptspace);
        }
    };
    LinebreakVisitor.prototype.visitMfencedNode = function (wrapper, i) {
        var mfenced = wrapper;
        var bbox = wrapper.getLineBBox(i);
        var _a = __read(this.getBorderLR(wrapper), 2), L = _a[0], R = _a[1];
        if (i === 0) {
            this.addWidth(bbox, bbox.L + L);
        }
        this.visitNode(mfenced.mrow, i);
        if (i === wrapper.breakCount) {
            this.addWidth(bbox, bbox.R + R);
        }
    };
    LinebreakVisitor.prototype.visitMactionNode = function (wrapper, i) {
        var maction = wrapper;
        var bbox = wrapper.getLineBBox(i);
        var _a = __read(this.getBorderLR(wrapper), 2), L = _a[0], R = _a[1];
        if (i === 0) {
            this.addWidth(bbox, bbox.L + L);
        }
        this.visitNode(maction.selected, i);
        if (i === wrapper.breakCount) {
            this.addWidth(bbox, bbox.R + R);
        }
    };
    return LinebreakVisitor;
}(Linebreaks));
exports.LinebreakVisitor = LinebreakVisitor;
(function () {
    var e_4, _a;
    try {
        for (var _b = __values(Object.keys(OperatorDictionary_js_1.OPTABLE.postfix)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var op = _c.value;
            var data = OperatorDictionary_js_1.OPTABLE.postfix[op][3];
            if (data && data.fence) {
                data.linebreakstyle = 'after';
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
    OperatorDictionary_js_1.OPTABLE.infix['\u2061'] = __spreadArray([], __read(OperatorDictionary_js_1.OPTABLE.infix['\u2061']), false);
    OperatorDictionary_js_1.OPTABLE.infix['\u2061'][3] = { linebreak: 'nobreak' };
})();
//# sourceMappingURL=LinebreakVisitor.js.map