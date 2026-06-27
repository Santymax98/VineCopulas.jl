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
exports.ChtmlMsubsup = exports.ChtmlMsup = exports.ChtmlMsub = void 0;
var msubsup_js_1 = require("../../common/Wrappers/msubsup.js");
var scriptbase_js_1 = require("./scriptbase.js");
var msubsup_js_2 = require("../../../core/MmlTree/MmlNodes/msubsup.js");
exports.ChtmlMsub = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsubMixin)(scriptbase_js_1.ChtmlScriptbase);
    return _a = (function (_super) {
            __extends(ChtmlMsub, _super);
            function ChtmlMsub() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ChtmlMsub;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsub.prototype.kind,
        _a;
})();
exports.ChtmlMsup = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsupMixin)(scriptbase_js_1.ChtmlScriptbase);
    return _a = (function (_super) {
            __extends(ChtmlMsup, _super);
            function ChtmlMsup() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ChtmlMsup;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsup.prototype.kind,
        _a;
})();
exports.ChtmlMsubsup = (function () {
    var _a;
    var Base = (0, msubsup_js_1.CommonMsubsupMixin)(scriptbase_js_1.ChtmlScriptbase);
    return _a = (function (_super) {
            __extends(ChtmlMsubsup, _super);
            function ChtmlMsubsup() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMsubsup.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                var adaptor = this.adaptor;
                var chtml = this.standardChtmlNodes(parents);
                var _b = __read([this.baseChild, this.supChild, this.subChild], 3), base = _b[0], sup = _b[1], sub = _b[2];
                var _c = __read(this.getUVQ(), 3), v = _c[1], q = _c[2];
                var style = { 'vertical-align': this.em(v) };
                base.toCHTML(chtml);
                var stack = adaptor.append(chtml[chtml.length - 1], this.html('mjx-script', { style: style }));
                sup.toCHTML([stack]);
                adaptor.append(stack, this.html('mjx-spacer', { style: { 'margin-top': this.em(q) } }));
                sub.toCHTML([stack]);
                var ic = this.getAdjustedIc();
                if (ic) {
                    adaptor.setStyle(sup.dom[0], 'marginLeft', this.em(ic / sup.bbox.rscale));
                    if (!this.baseIsChar) {
                        adaptor.setStyle(sub.dom[0], 'marginLeft', this.em(ic / sup.bbox.rscale));
                    }
                }
                if (this.baseRemoveIc) {
                    adaptor.setStyle(stack, 'marginLeft', this.em(-this.baseIc));
                }
            };
            return ChtmlMsubsup;
        }(Base)),
        _a.kind = msubsup_js_2.MmlMsubsup.prototype.kind,
        _a.styles = {
            'mjx-script': {
                display: 'inline-block',
                'padding-right': '.05em',
                'padding-left': '.033em',
            },
            'mjx-script > mjx-spacer': {
                display: 'block',
            },
        },
        _a;
})();
//# sourceMappingURL=msubsup.js.map