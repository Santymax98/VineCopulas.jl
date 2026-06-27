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
exports.ChtmlMath = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var math_js_1 = require("../../common/Wrappers/math.js");
var math_js_2 = require("../../../core/MmlTree/MmlNodes/math.js");
var BBox_js_1 = require("../../../util/BBox.js");
exports.ChtmlMath = (function () {
    var _a;
    var Base = (0, math_js_1.CommonMathMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMath, _super);
            function ChtmlMath() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMath.prototype.handleDisplay = function (parent) {
                var adaptor = this.adaptor;
                var _b = __read(this.getAlignShift(), 2), align = _b[0], shift = _b[1];
                if (align !== 'center') {
                    adaptor.setAttribute(parent, 'justify', align);
                }
                if (this.bbox.pwidth === BBox_js_1.BBox.fullWidth) {
                    adaptor.setAttribute(parent, 'width', 'full');
                    if (this.jax.table) {
                        var _c = this.jax.table.getOuterBBox(), L = _c.L, w = _c.w, R = _c.R;
                        if (align === 'right') {
                            R = Math.max(R || -shift, -shift);
                        }
                        else if (align === 'left') {
                            L = Math.max(L || shift, shift);
                        }
                        else if (align === 'center') {
                            w += 2 * Math.abs(shift);
                        }
                        var W = this.em(Math.max(0, L + w + R));
                        adaptor.setStyle(parent, 'min-width', W);
                        adaptor.setStyle(this.jax.table.dom[0], 'min-width', W);
                    }
                }
                else {
                    this.setIndent(this.dom[0], align, shift);
                }
            };
            ChtmlMath.prototype.handleInline = function (parent) {
                var adaptor = this.adaptor;
                var margin = adaptor.getStyle(this.dom[0], 'margin-right');
                if (margin) {
                    adaptor.setStyle(this.dom[0], 'margin-right', '');
                    adaptor.setStyle(parent, 'margin-right', margin);
                    adaptor.setStyle(parent, 'width', '0');
                }
            };
            ChtmlMath.prototype.toCHTML = function (parents) {
                _super.prototype.toCHTML.call(this, parents);
                var adaptor = this.adaptor;
                var display = this.node.attributes.get('display') === 'block';
                if (display) {
                    adaptor.setAttribute(this.dom[0], 'display', 'true');
                    adaptor.setAttribute(parents[0], 'display', 'true');
                    this.handleDisplay(parents[0]);
                }
                else {
                    this.handleInline(parents[0]);
                }
                adaptor.addClass(this.dom[0], "".concat(this.font.cssFontPrefix, "-N"));
            };
            ChtmlMath.prototype.setChildPWidths = function (recompute, w, clear) {
                if (w === void 0) { w = null; }
                if (clear === void 0) { clear = true; }
                return this.parent ? _super.prototype.setChildPWidths.call(this, recompute, w, clear) : false;
            };
            ChtmlMath.prototype.handleAttributes = function () {
                _super.prototype.handleAttributes.call(this);
                var adaptor = this.adaptor;
                if (this.node.getProperty('process-breaks')) {
                    this.dom.forEach(function (dom) {
                        return adaptor.setAttribute(dom, 'breakable', 'true');
                    });
                }
            };
            return ChtmlMath;
        }(Base)),
        _a.kind = math_js_2.MmlMath.prototype.kind,
        _a.styles = {
            'mjx-math': {
                'line-height': 0,
                'text-align': 'left',
                'text-indent': 0,
                'font-style': 'normal',
                'font-weight': 'normal',
                'font-size': '100%',
                'font-size-adjust': 'none',
                'letter-spacing': 'normal',
                'word-wrap': 'normal',
                'word-spacing': 'normal',
                direction: 'ltr',
                padding: '1px 0',
            },
            'mjx-container[jax="CHTML"][display="true"] mjx-math': {
                padding: 0,
            },
            'mjx-math[breakable]': {
                display: 'inline',
            },
            'mjx-container[jax="CHTML"] mjx-break': {
                'white-space': 'normal',
                'line-height': '0',
                'clip-path': 'rect(0 0 0 0)',
                'font-family': 'MJX-BRK !important',
            },
            'mjx-break[size="0"]': {
                'letter-spacing': 0.001 - 1 + 'em',
            },
            'mjx-break[size="1"]': {
                'letter-spacing': 0.111 - 1 + 'em',
            },
            'mjx-break[size="2"]': {
                'letter-spacing': 0.167 - 1 + 'em',
            },
            'mjx-break[size="3"]': {
                'letter-spacing': 0.222 - 1 + 'em',
            },
            'mjx-break[size="4"]': {
                'letter-spacing': 0.278 - 1 + 'em',
            },
            'mjx-break[size="5"]': {
                'letter-spacing': 0.333 - 1 + 'em',
            },
        },
        _a;
})();
//# sourceMappingURL=math.js.map