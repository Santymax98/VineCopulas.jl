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
exports.SvgMroot = void 0;
var mroot_js_1 = require("../../common/Wrappers/mroot.js");
var mroot_js_2 = require("../../../core/MmlTree/MmlNodes/mroot.js");
var msqrt_js_1 = require("./msqrt.js");
exports.SvgMroot = (function () {
    var _a;
    var Base = (0, mroot_js_1.CommonMrootMixin)(msqrt_js_1.SvgMsqrt);
    return _a = (function (_super) {
            __extends(SvgMroot, _super);
            function SvgMroot() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMroot.prototype.addRoot = function (ROOT, root, sbox, H) {
                root.toSVG(ROOT);
                var _b = __read(this.getRootDimens(sbox, H), 3), x = _b[0], h = _b[1], dx = _b[2];
                var bbox = root.getOuterBBox();
                root.place(dx * bbox.rscale, h);
                return x;
            };
            return SvgMroot;
        }(Base)),
        _a.kind = mroot_js_2.MmlMroot.prototype.kind,
        _a;
})();
//# sourceMappingURL=mroot.js.map