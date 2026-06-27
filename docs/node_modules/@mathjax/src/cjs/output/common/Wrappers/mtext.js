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
exports.CommonMtextMixin = CommonMtextMixin;
var LineBBox_js_1 = require("../LineBBox.js");
function CommonMtextMixin(Base) {
    var _a;
    return _a = (function (_super) {
            __extends(CommonMtextMixin, _super);
            function CommonMtextMixin() {
                var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
                _this.breakPoints = [];
                return _this;
            }
            CommonMtextMixin.prototype.textWidth = function (text) {
                var textNode = this.textNode;
                if (!textNode) {
                    var text_1 = this.node.factory.create('text');
                    text_1.parent = this.node;
                    textNode = this.textNode = this.factory.wrap(text_1);
                    textNode.parent = this;
                }
                textNode.node.setText(text);
                textNode.invalidateBBox(false);
                return textNode.getBBox().w;
            };
            Object.defineProperty(CommonMtextMixin.prototype, "breakCount", {
                get: function () {
                    return this.breakPoints.length;
                },
                enumerable: false,
                configurable: true
            });
            CommonMtextMixin.prototype.getVariant = function () {
                var options = this.jax.options;
                var data = this.jax.math.outputData;
                var merror = (!!data.merrorFamily || !!options.merrorFont) &&
                    this.node.Parent.isKind('merror');
                if (!!data.mtextFamily || !!options.mtextFont || merror) {
                    var variant = this.node.attributes.get('mathvariant');
                    var font = this.constructor.INHERITFONTS[variant] ||
                        this.jax.font.getCssFont(variant);
                    var family = font[0] ||
                        (merror
                            ? data.merrorFamily || options.merrorFont
                            : data.mtextFamily || options.mtextFont);
                    this.variant = this.explicitVariant(family, font[2] ? 'bold' : '', font[1] ? 'italic' : '');
                    return;
                }
                _super.prototype.getVariant.call(this);
            };
            CommonMtextMixin.prototype.setBreakAt = function (ij) {
                this.breakPoints.push(ij);
            };
            CommonMtextMixin.prototype.clearBreakPoints = function () {
                this.breakPoints = [];
            };
            CommonMtextMixin.prototype.computeLineBBox = function (i) {
                var bbox = LineBBox_js_1.LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
                if (!this.breakCount)
                    return bbox;
                bbox.w = this.getBreakWidth(i);
                if (i === 0) {
                    bbox.R = 0;
                    this.addLeftBorders(bbox);
                }
                else {
                    bbox.L = 0;
                    bbox.indentData = [
                        ['left', '0'],
                        ['left', '0'],
                        ['left', '0'],
                    ];
                    if (i === this.breakCount) {
                        this.addRightBorders(bbox);
                    }
                }
                return bbox;
            };
            CommonMtextMixin.prototype.getBreakWidth = function (i) {
                var childNodes = this.childNodes;
                var _b = __read(this.breakPoints[i - 1] || [0, 0], 2), si = _b[0], sj = _b[1];
                var _c = __read(this.breakPoints[i] || [childNodes.length, 0], 2), ei = _c[0], ej = _c[1];
                var words = childNodes[si].node.getText().split(/ /);
                if (si === ei) {
                    return this.textWidth(words.slice(sj, ej).join(' '));
                }
                var w = this.textWidth(words.slice(sj).join(' '));
                while (++si < ei && si < childNodes.length) {
                    w += childNodes[si].getBBox().w;
                }
                if (si < childNodes.length) {
                    words = childNodes[si].node.getText().split(/ /);
                    w += this.textWidth(words.slice(0, ej).join(' '));
                }
                return w;
            };
            return CommonMtextMixin;
        }(Base)),
        _a.INHERITFONTS = {
            normal: ['', false, false],
            bold: ['', false, true],
            italic: ['', true, false],
            'bold-italic': ['', true, true],
        },
        _a;
}
//# sourceMappingURL=mtext.js.map