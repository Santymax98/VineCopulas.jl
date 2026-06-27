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
exports.ChtmlMspace = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mspace_js_1 = require("../../common/Wrappers/mspace.js");
var mspace_js_2 = require("../../../core/MmlTree/MmlNodes/mspace.js");
exports.ChtmlMspace = (function () {
    var _a;
    var Base = (0, mspace_js_1.CommonMspaceMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMspace, _super);
            function ChtmlMspace() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMspace.prototype.toCHTML = function (parents) {
                var _this = this;
                if (parents.length > 1) {
                    parents.forEach(function (dom) {
                        return _this.adaptor.append(dom, _this.html('mjx-linestrut'));
                    });
                }
                var chtml = this.standardChtmlNodes(parents);
                var _b = this.getBBox(), w = _b.w, h = _b.h, d = _b.d;
                if (w < 0) {
                    this.adaptor.setStyle(chtml[0], 'marginRight', this.em(w));
                    w = 0;
                }
                if (w && !this.breakCount) {
                    this.adaptor.setStyle(chtml[0], 'width', this.em(w));
                }
                h = Math.max(0, h + d);
                if (h) {
                    this.adaptor.setStyle(chtml[0], 'height', this.em(Math.max(0, h)));
                }
                if (d) {
                    this.adaptor.setStyle(chtml[0], 'verticalAlign', this.em(-d));
                }
            };
            return ChtmlMspace;
        }(Base)),
        _a.kind = mspace_js_2.MmlMspace.prototype.kind,
        _a;
})();
//# sourceMappingURL=mspace.js.map