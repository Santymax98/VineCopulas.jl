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
exports.SvgMglyph = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mglyph_js_1 = require("../../common/Wrappers/mglyph.js");
var mglyph_js_2 = require("../../../core/MmlTree/MmlNodes/mglyph.js");
exports.SvgMglyph = (function () {
    var _a;
    var Base = (0, mglyph_js_1.CommonMglyphMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMglyph, _super);
            function SvgMglyph() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMglyph.prototype.toSVG = function (parents) {
                var svg = this.standardSvgNodes(parents);
                if (this.charWrapper) {
                    this.charWrapper.toSVG(svg);
                    return;
                }
                var _b = this.node.attributes.getList('src', 'alt'), src = _b.src, alt = _b.alt;
                var h = this.fixed(this.height);
                var w = this.fixed(this.width);
                var y = this.fixed(this.height + (this.valign || 0));
                var properties = {
                    width: w,
                    height: h,
                    transform: 'translate(0 ' + y + ') matrix(1 0 0 -1 0 0)',
                    preserveAspectRatio: 'none',
                    'aria-label': alt,
                    href: src,
                };
                var img = this.svg('image', properties);
                this.adaptor.append(svg[0], img);
            };
            return SvgMglyph;
        }(Base)),
        _a.kind = mglyph_js_2.MmlMglyph.prototype.kind,
        _a;
})();
//# sourceMappingURL=mglyph.js.map