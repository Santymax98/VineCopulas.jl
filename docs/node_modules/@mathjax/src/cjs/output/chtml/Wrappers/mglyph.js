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
exports.ChtmlMglyph = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mglyph_js_1 = require("../../common/Wrappers/mglyph.js");
var mglyph_js_2 = require("../../../core/MmlTree/MmlNodes/mglyph.js");
exports.ChtmlMglyph = (function () {
    var _a;
    var Base = (0, mglyph_js_1.CommonMglyphMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMglyph, _super);
            function ChtmlMglyph() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMglyph.prototype.toCHTML = function (parents) {
                var chtml = this.standardChtmlNodes(parents);
                if (this.charWrapper) {
                    this.charWrapper.toCHTML(chtml);
                    return;
                }
                var _b = this.node.attributes.getList('src', 'alt'), src = _b.src, alt = _b.alt;
                var styles = {
                    width: this.em(this.width),
                    height: this.em(this.height),
                };
                if (this.valign) {
                    styles.verticalAlign = this.em(this.valign);
                }
                var img = this.html('img', {
                    src: src,
                    style: styles,
                    alt: alt,
                    title: alt,
                });
                this.adaptor.append(chtml[0], img);
            };
            return ChtmlMglyph;
        }(Base)),
        _a.kind = mglyph_js_2.MmlMglyph.prototype.kind,
        _a.styles = {
            'mjx-mglyph > img': {
                display: 'inline-block',
                border: 0,
                padding: 0,
            },
        },
        _a;
})();
//# sourceMappingURL=mglyph.js.map