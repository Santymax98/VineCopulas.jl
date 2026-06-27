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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChtmlTextNode = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var TextNode_js_1 = require("../../common/Wrappers/TextNode.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
exports.ChtmlTextNode = (function () {
    var _a;
    var Base = (0, TextNode_js_1.CommonTextNodeMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlTextNode, _super);
            function ChtmlTextNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlTextNode.prototype.toCHTML = function (parents) {
                this.markUsed();
                var parent = parents[0];
                var adaptor = this.adaptor;
                var variant = this.parent.variant;
                var text = this.node.getText();
                if (text.length === 0)
                    return;
                var bbox = this.getBBox();
                if (variant === '-explicitFont') {
                    adaptor.append(parent, this.jax.unknownText(text, variant, bbox.w));
                }
                else {
                    var utext = '';
                    var chars = this.remappedText(text, variant);
                    var H = chars.length > 1 ? this.em(this.parent.getBBox().h) : '';
                    var m = chars.length;
                    for (var i = 0; i < m; i++) {
                        var n = chars[i];
                        var data = this.getVariantChar(variant, n)[3];
                        if (data.unknown) {
                            utext += String.fromCodePoint(n);
                        }
                        else {
                            utext = this.addUtext(utext, variant, parent);
                            var font = data.ff || (data.f ? "".concat(this.font.cssFontPrefix, "-").concat(data.f) : '');
                            var node = adaptor.append(parent, this.html('mjx-c', { class: this.char(n) + (font ? ' ' + font : '') }, [this.text(data.c || String.fromCodePoint(n))]));
                            if (i < m - 1 || bbox.oc) {
                                adaptor.setAttribute(node, 'noic', 'true');
                            }
                            if (H) {
                                adaptor.setStyle(node, 'padding-top', H);
                            }
                            this.font.charUsage.add([variant, n]);
                        }
                    }
                    this.addUtext(utext, variant, parent);
                }
            };
            ChtmlTextNode.prototype.addUtext = function (utext, variant, parent) {
                if (utext) {
                    this.adaptor.append(parent, this.jax.unknownText(utext, variant));
                }
                return '';
            };
            return ChtmlTextNode;
        }(Base)),
        _a.kind = MmlNode_js_1.TextNode.prototype.kind,
        _a.autoStyle = false,
        _a.styles = {
            'mjx-c': {
                display: 'inline-block',
                width: 0,
                'text-align': 'right',
            },
            'mjx-utext': {
                display: 'inline-block',
                padding: '.75em 0 .2em 0',
            },
        },
        _a;
})();
//# sourceMappingURL=TextNode.js.map