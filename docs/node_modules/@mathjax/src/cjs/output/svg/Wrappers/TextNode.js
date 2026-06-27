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
exports.SvgTextNode = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var TextNode_js_1 = require("../../common/Wrappers/TextNode.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
exports.SvgTextNode = (function () {
    var _a;
    var Base = (0, TextNode_js_1.CommonTextNodeMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgTextNode, _super);
            function SvgTextNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgTextNode.addStyles = function (styles, jax) {
                styles.addStyles({
                    'mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c]': {
                        'stroke-width': jax.options.blacker,
                    },
                });
            };
            SvgTextNode.prototype.toSVG = function (parents) {
                var e_1, _b;
                var adaptor = this.adaptor;
                var variant = this.parent.variant;
                var text = this.node.getText();
                if (text.length === 0)
                    return;
                if (variant === '-explicitFont') {
                    this.dom = [
                        adaptor.append(parents[0], this.jax.unknownText(text, variant)),
                    ];
                }
                else {
                    var chars = this.remappedText(text, variant);
                    if (this.parent.childNodes.length > 1) {
                        parents = this.dom = [
                            adaptor.append(parents[0], this.svg('g', { 'data-mml-node': 'text' })),
                        ];
                    }
                    else {
                        this.dom = parents;
                    }
                    var x = 0;
                    try {
                        for (var chars_1 = __values(chars), chars_1_1 = chars_1.next(); !chars_1_1.done; chars_1_1 = chars_1.next()) {
                            var n = chars_1_1.value;
                            x += this.placeChar(n, x, 0, parents[0], variant, true);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (chars_1_1 && !chars_1_1.done && (_b = chars_1.return)) _b.call(chars_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    this.addUtext(x, 0, parents[0], variant);
                }
            };
            return SvgTextNode;
        }(Base)),
        _a.kind = MmlNode_js_1.TextNode.prototype.kind,
        _a;
})();
//# sourceMappingURL=TextNode.js.map