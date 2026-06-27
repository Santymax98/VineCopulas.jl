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
exports.SvgMfenced = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mfenced_js_1 = require("../../common/Wrappers/mfenced.js");
var mfenced_js_2 = require("../../../core/MmlTree/MmlNodes/mfenced.js");
exports.SvgMfenced = (function () {
    var _a;
    var Base = (0, mfenced_js_1.CommonMfencedMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMfenced, _super);
            function SvgMfenced() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMfenced.prototype.toSVG = function (parents) {
                var svg = this.standardSvgNodes(parents);
                this.setChildrenParent(this.mrow);
                this.mrow.toSVG(svg);
                this.setChildrenParent(this);
            };
            SvgMfenced.prototype.setChildrenParent = function (parent) {
                var e_1, _b;
                try {
                    for (var _c = __values(this.childNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var child = _d.value;
                        child.parent = parent;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            return SvgMfenced;
        }(Base)),
        _a.kind = mfenced_js_2.MmlMfenced.prototype.kind,
        _a;
})();
//# sourceMappingURL=mfenced.js.map