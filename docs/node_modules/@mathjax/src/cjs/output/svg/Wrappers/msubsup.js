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
exports.SvgMsubsup = exports.SvgMsup = exports.SvgMsub = void 0;
var msubsup_js_1 = require("../../common/Wrappers/msubsup.js");
var scriptbase_js_1 = require("./scriptbase.js");
var msubsup_js_2 = require("../../../core/MmlTree/MmlNodes/msubsup.js");
exports.SvgMsub = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsubMixin)(scriptbase_js_1.SvgScriptbase);
    return _a = (function (_super) {
            __extends(SvgMsub, _super);
            function SvgMsub() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgMsub;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsub.prototype.kind,
        _a;
})();
exports.SvgMsup = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsupMixin)(scriptbase_js_1.SvgScriptbase);
    return _a = (function (_super) {
            __extends(SvgMsup, _super);
            function SvgMsup() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgMsup;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsup.prototype.kind,
        _a;
})();
exports.SvgMsubsup = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsubsupMixin)(scriptbase_js_1.SvgScriptbase);
    return _a = (function (_super) {
            __extends(SvgMsubsup, _super);
            function SvgMsubsup() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMsubsup.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                var svg = this.standardSvgNodes(parents);
                var _b = __read([this.baseChild, this.supChild, this.subChild], 3), base = _b[0], sup = _b[1], sub = _b[2];
                var w = this.getBaseWidth();
                var x = this.getAdjustedIc();
                var _c = __read(this.getUVQ(), 2), u = _c[0], v = _c[1];
                base.toSVG(svg);
                var tail = [svg[svg.length - 1]];
                sup.toSVG(tail);
                sub.toSVG(tail);
                base.place(0, 0);
                sub.place(w + (this.baseIsChar ? 0 : x), v);
                sup.place(w + x, u);
            };
            return SvgMsubsup;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsubsup.prototype.kind,
        _a;
})();
//# sourceMappingURL=msubsup.js.map