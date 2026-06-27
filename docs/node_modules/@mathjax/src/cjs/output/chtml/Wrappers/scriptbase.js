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
exports.ChtmlScriptbase = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var scriptbase_js_1 = require("../../common/Wrappers/scriptbase.js");
var msubsup_js_1 = require("./msubsup.js");
exports.ChtmlScriptbase = (function () {
    var _a;
    var Base = (0, scriptbase_js_1.CommonScriptbaseMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlScriptbase, _super);
            function ChtmlScriptbase() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlScriptbase.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                this.dom = this.standardChtmlNodes(parents);
                var _b = __read(this.getOffset(), 2), x = _b[0], v = _b[1];
                var dx = x - (this.baseRemoveIc ? this.baseIc : 0);
                var style = { 'vertical-align': this.em(v) };
                if (dx) {
                    style['margin-left'] = this.em(dx);
                }
                this.baseChild.toCHTML(this.dom);
                var dom = this.dom[this.dom.length - 1];
                this.scriptChild.toCHTML([
                    this.adaptor.append(dom, this.html('mjx-script', { style: style })),
                ]);
            };
            ChtmlScriptbase.prototype.markUsed = function () {
                _super.prototype.markUsed.call(this);
                this.jax.wrapperUsage.add(msubsup_js_1.ChtmlMsubsup.kind);
            };
            ChtmlScriptbase.prototype.setDeltaW = function (nodes, dx) {
                for (var i = 0; i < dx.length; i++) {
                    if (dx[i]) {
                        this.adaptor.setStyle(nodes[i], 'paddingLeft', this.em(dx[i]));
                    }
                }
            };
            ChtmlScriptbase.prototype.adjustOverDepth = function (over, overbox) {
                if (overbox.d >= 0)
                    return;
                this.adaptor.setStyle(over, 'marginBottom', this.em(overbox.d * overbox.rscale));
            };
            ChtmlScriptbase.prototype.adjustUnderDepth = function (under, underbox) {
                var e_1, _b;
                if (underbox.d >= 0)
                    return;
                var adaptor = this.adaptor;
                var v = this.em(underbox.d);
                var box = this.html('mjx-box', {
                    style: { 'margin-bottom': v, 'vertical-align': v },
                });
                try {
                    for (var _c = __values(adaptor.childNodes(adaptor.firstChild(under))), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var child = _d.value;
                        adaptor.append(box, child);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                adaptor.append(adaptor.firstChild(under), box);
            };
            ChtmlScriptbase.prototype.adjustBaseHeight = function (base, basebox) {
                if (this.node.attributes.get('accent')) {
                    var minH = this.font.params.x_height * this.baseScale;
                    if (basebox.h < minH) {
                        this.adaptor.setStyle(base, 'paddingTop', this.em(minH - basebox.h));
                        basebox.h = minH;
                    }
                }
            };
            return ChtmlScriptbase;
        }(Base)),
        _a.kind = 'scriptbase',
        _a;
})();
//# sourceMappingURL=scriptbase.js.map