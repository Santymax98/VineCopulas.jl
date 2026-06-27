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
exports.SvgScriptbase = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var scriptbase_js_1 = require("../../common/Wrappers/scriptbase.js");
exports.SvgScriptbase = (function () {
    var _a;
    var Base = (0, scriptbase_js_1.CommonScriptbaseMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgScriptbase, _super);
            function SvgScriptbase() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgScriptbase.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                var svg = this.standardSvgNodes(parents);
                var w = this.getBaseWidth();
                var _b = __read(this.getOffset(), 2), x = _b[0], v = _b[1];
                this.baseChild.toSVG(svg);
                this.baseChild.place(0, 0);
                this.scriptChild.toSVG([svg[svg.length - 1]]);
                this.scriptChild.place(w + x, v);
            };
            return SvgScriptbase;
        }(Base)),
        _a.kind = 'scriptbase',
        _a;
})();
//# sourceMappingURL=scriptbase.js.map