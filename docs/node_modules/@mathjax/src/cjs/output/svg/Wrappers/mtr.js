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
exports.SvgMlabeledtr = exports.SvgMtr = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mtr_js_1 = require("../../common/Wrappers/mtr.js");
var mtr_js_2 = require("../../../core/MmlTree/MmlNodes/mtr.js");
exports.SvgMtr = (function () {
    var _a;
    var Base = (0, mtr_js_1.CommonMtrMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMtr, _super);
            function SvgMtr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMtr.prototype.placeCell = function (cell, sizes) {
                var x = sizes.x, y = sizes.y, lSpace = sizes.lSpace, w = sizes.w, rSpace = sizes.rSpace, lLine = sizes.lLine, rLine = sizes.rLine;
                var scale = 1 / this.getBBox().rscale;
                var _b = __read([this.H * scale, this.D * scale], 2), h = _b[0], d = _b[1];
                var _c = __read([this.tSpace * scale, this.bSpace * scale], 2), t = _c[0], b = _c[1];
                var _d = __read(cell.placeCell(x + lSpace, y, w, h, d), 2), dx = _d[0], dy = _d[1];
                var W = lSpace + w + rSpace;
                cell.placeColor(-(dx + lSpace + lLine / 2), -(d + b + dy), W + (lLine + rLine) / 2, h + d + t + b);
                return W + rLine;
            };
            SvgMtr.prototype.placeCells = function (svg) {
                var parent = this.parent;
                var cSpace = parent.getColumnHalfSpacing();
                var cLines = __spreadArray(__spreadArray([parent.fLine], __read(parent.cLines), false), [parent.fLine], false);
                var cWidth = parent.getComputedWidths();
                var scale = 1 / this.getBBox().rscale;
                var x = cLines[0];
                for (var i = 0; i < this.numCells; i++) {
                    var child = this.getChild(i);
                    child.toSVG(svg);
                    x += this.placeCell(child, {
                        x: x,
                        y: 0,
                        lSpace: cSpace[i] * scale,
                        rSpace: cSpace[i + 1] * scale,
                        w: cWidth[i] * scale,
                        lLine: cLines[i] * scale,
                        rLine: cLines[i + 1] * scale,
                    });
                }
            };
            SvgMtr.prototype.placeColor = function () {
                var scale = 1 / this.getBBox().rscale;
                var adaptor = this.adaptor;
                var child = this.firstChild();
                if (child &&
                    adaptor.kind(child) === 'rect' &&
                    adaptor.getAttribute(child, 'data-bgcolor')) {
                    var _b = __read([(this.tLine / 2) * scale, (this.bLine / 2) * scale], 2), TL = _b[0], BL = _b[1];
                    var _c = __read([this.tSpace * scale, this.bSpace * scale], 2), TS = _c[0], BS = _c[1];
                    var _d = __read([this.H * scale, this.D * scale], 2), H = _d[0], D = _d[1];
                    adaptor.setAttribute(child, 'y', this.fixed(-(D + BS + BL)));
                    adaptor.setAttribute(child, 'width', this.fixed(this.parent.getWidth() * scale));
                    adaptor.setAttribute(child, 'height', this.fixed(TL + TS + H + D + BS + BL));
                }
            };
            SvgMtr.prototype.toSVG = function (parents) {
                var svg = this.standardSvgNodes(parents);
                this.placeCells(svg);
                this.placeColor();
            };
            return SvgMtr;
        }(Base)),
        _a.kind = mtr_js_2.MmlMtr.prototype.kind,
        _a;
})();
exports.SvgMlabeledtr = (function () {
    var _a;
    var Base = (0, mtr_js_1.CommonMlabeledtrMixin)(exports.SvgMtr);
    return _a = (function (_super) {
            __extends(SvgMlabeledtr, _super);
            function SvgMlabeledtr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMlabeledtr.prototype.toSVG = function (parents) {
                _super.prototype.toSVG.call(this, parents);
                var child = this.childNodes[0];
                if (child) {
                    child.toSVG([this.parent.labels]);
                }
            };
            return SvgMlabeledtr;
        }(Base)),
        _a.kind = mtr_js_2.MmlMlabeledtr.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtr.js.map