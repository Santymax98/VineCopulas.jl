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
exports.SvgMath = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var math_js_1 = require("../../common/Wrappers/math.js");
var math_js_2 = require("../../../core/MmlTree/MmlNodes/math.js");
var BBox_js_1 = require("../../../util/BBox.js");
var zero_js_1 = require("./zero.js");
exports.SvgMath = (function () {
    var _a;
    var Base = (0, math_js_1.CommonMathMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMath, _super);
            function SvgMath() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMath.prototype.handleDisplay = function () {
                var _b = __read(this.getAlignShift(), 2), align = _b[0], shift = _b[1];
                if (align !== 'center') {
                    this.adaptor.setAttribute(this.jax.container, 'justify', align);
                }
                if (this.bbox.pwidth === BBox_js_1.BBox.fullWidth) {
                    this.adaptor.setAttribute(this.jax.container, 'width', 'full');
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
                        this.jax.minwidth = Math.max(0, L + w + R);
                    }
                }
                else {
                    this.jax.shift = shift;
                }
            };
            SvgMath.prototype.toSVG = function (parents) {
                _super.prototype.toSVG.call(this, parents);
                var adaptor = this.adaptor;
                var display = this.node.attributes.get('display') === 'block';
                if (display) {
                    adaptor.setAttribute(this.jax.container, 'display', 'true');
                    this.handleDisplay();
                }
            };
            SvgMath.prototype.setChildPWidths = function (recompute, w, _clear) {
                if (w === void 0) { w = null; }
                if (_clear === void 0) { _clear = true; }
                return _super.prototype.setChildPWidths.call(this, recompute, this.parent ? w : this.metrics.containerWidth / this.jax.pxPerEm, false);
            };
            return SvgMath;
        }(Base)),
        _a.kind = math_js_2.MmlMath.prototype.kind,
        _a.styles = {
            'mjx-container[jax="SVG"] mjx-break': {
                'white-space': 'normal',
                'line-height': '0',
                'clip-path': 'rect(0 0 0 0)',
                'font-family': 'MJX-ZERO ! important',
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
            'mjx-container[jax="SVG"] mjx-break[newline]::before': {
                'white-space': 'pre',
                content: '"\\A"',
            },
            'mjx-break[newline] + svg[width="0.054ex"]': {
                'margin-right': '-1px',
            },
            'mjx-break[prebreak]': {
                'letter-spacing': '-.999em',
            },
            '@font-face /* zero */': {
                'font-family': 'MJX-ZERO',
                src: zero_js_1.ZeroFontDataUrl,
            },
        },
        _a;
})();
//# sourceMappingURL=math.js.map