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
exports.SvgMerror = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var merror_js_1 = require("../../../core/MmlTree/MmlNodes/merror.js");
exports.SvgMerror = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(SvgMerror, _super);
            function SvgMerror() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMerror.prototype.toSVG = function (parents) {
                var svg = this.standardSvgNodes(parents);
                var _b = this.getBBox(), h = _b.h, d = _b.d, w = _b.w;
                this.adaptor.append(this.dom[0], this.svg('rect', {
                    'data-background': true,
                    width: this.fixed(w),
                    height: this.fixed(h + d),
                    y: this.fixed(-d),
                }));
                var title = this.node.attributes.get('title');
                if (title) {
                    this.adaptor.append(this.dom[0], this.svg('title', {}, [this.adaptor.text(title)]));
                }
                this.addChildren(svg);
            };
            return SvgMerror;
        }(Wrapper_js_1.SvgWrapper)),
        _a.kind = merror_js_1.MmlMerror.prototype.kind,
        _a.styles = {
            'g[data-mml-node="merror"] > g': {
                fill: 'red',
                stroke: 'red',
            },
            'g[data-mml-node="merror"] > rect[data-background]': {
                fill: 'yellow',
                stroke: 'none',
            },
        },
        _a;
})();
//# sourceMappingURL=merror.js.map