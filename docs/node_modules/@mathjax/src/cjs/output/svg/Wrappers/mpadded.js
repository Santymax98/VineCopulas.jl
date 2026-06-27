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
exports.SvgMpadded = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mpadded_js_1 = require("../../common/Wrappers/mpadded.js");
var mpadded_js_2 = require("../../../core/MmlTree/MmlNodes/mpadded.js");
exports.SvgMpadded = (function () {
    var _a;
    var Base = (0, mpadded_js_1.CommonMpaddedMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMpadded, _super);
            function SvgMpadded() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMpadded.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                var svg = this.standardSvgNodes(parents);
                var _b = __read(this.getDimens(), 9), dw = _b[5], x = _b[6], y = _b[7], dx = _b[8];
                var align = this.node.attributes.get('data-align') || 'left';
                var dW = dw < 0 && align !== 'left' ? (align === 'center' ? dw / 2 : dw) : 0;
                var X = x + dx - dW;
                if (X || y) {
                    svg = [this.adaptor.append(svg[0], this.svg('g'))];
                    this.place(X, y, svg[0]);
                }
                this.addChildren(svg);
            };
            return SvgMpadded;
        }(Base)),
        _a.kind = mpadded_js_2.MmlMpadded.prototype.kind,
        _a;
})();
//# sourceMappingURL=mpadded.js.map