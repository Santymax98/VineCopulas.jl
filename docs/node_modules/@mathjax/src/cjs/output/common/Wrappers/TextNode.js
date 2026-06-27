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
exports.CommonTextNodeMixin = CommonTextNodeMixin;
function CommonTextNodeMixin(Base) {
    return (function (_super) {
        __extends(CommonTextNodeMixin, _super);
        function CommonTextNodeMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommonTextNodeMixin.prototype.remappedText = function (text, variant) {
            var c = this.parent.stretch.c;
            return c ? [c] : this.parent.remapChars(this.unicodeChars(text, variant));
        };
        CommonTextNodeMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            var variant = this.parent.variant;
            var text = this.node.getText();
            if (variant === '-explicitFont') {
                var font = this.jax.getFontData(this.parent.styles);
                var _a = this.jax.measureText(text, variant, font), w = _a.w, h = _a.h, d = _a.d;
                bbox.h = h;
                bbox.d = d;
                bbox.w = w;
            }
            else {
                var chars = this.remappedText(text, variant);
                var utext = '';
                bbox.empty();
                for (var i = 0; i < chars.length; i++) {
                    var _b = __read(this.getVariantChar(variant, chars[i]), 4), h = _b[0], d = _b[1], w = _b[2], data = _b[3];
                    if (data.unknown) {
                        utext += String.fromCodePoint(chars[i]);
                    }
                    else {
                        utext = this.addUtextBBox(bbox, utext, variant);
                        this.updateBBox(bbox, h, d, w);
                        bbox.ic = data.ic || 0;
                        bbox.sk = data.sk || 0;
                        bbox.dx = data.dx || 0;
                        if (!data.oc || i < chars.length - 1)
                            continue;
                        var children = this.parent.childNodes;
                        if (this.node !== children[children.length - 1].node)
                            continue;
                        var parent_1 = this.parent.parent.node;
                        var next = parent_1.isKind('mrow') || parent_1.isInferred
                            ? parent_1.childNodes[parent_1.childIndex(this.parent.node) + 1]
                            : null;
                        if ((next === null || next === void 0 ? void 0 : next.isKind('mo')) && next.getText() === '\u2062') {
                            next = parent_1.childNodes[parent_1.childIndex(next) + 1];
                        }
                        if (!next || next.attributes.get('mathvariant') !== variant) {
                            bbox.ic = data.oc;
                        }
                        else {
                            bbox.oc = data.oc;
                        }
                    }
                }
                this.addUtextBBox(bbox, utext, variant);
                if (chars.length > 1) {
                    bbox.sk = 0;
                }
                bbox.clean();
            }
        };
        CommonTextNodeMixin.prototype.addUtextBBox = function (bbox, utext, variant) {
            if (utext) {
                var _a = this.jax.measureText(utext, variant), h = _a.h, d = _a.d, w = _a.w;
                this.updateBBox(bbox, h, d, w);
            }
            return '';
        };
        CommonTextNodeMixin.prototype.updateBBox = function (bbox, h, d, w) {
            bbox.w += w;
            if (h > bbox.h) {
                bbox.h = h;
            }
            if (d > bbox.d) {
                bbox.d = d;
            }
        };
        CommonTextNodeMixin.prototype.getStyles = function () { };
        CommonTextNodeMixin.prototype.getVariant = function () { };
        CommonTextNodeMixin.prototype.getScale = function () { };
        CommonTextNodeMixin.prototype.getSpace = function () { };
        return CommonTextNodeMixin;
    }(Base));
}
//# sourceMappingURL=TextNode.js.map