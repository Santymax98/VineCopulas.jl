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
exports.SvgMtext = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mtext_js_1 = require("../../common/Wrappers/mtext.js");
var mtext_js_2 = require("../../../core/MmlTree/MmlNodes/mtext.js");
exports.SvgMtext = (function () {
    var _a;
    var Base = (0, mtext_js_1.CommonMtextMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMtext, _super);
            function SvgMtext() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMtext.prototype.toSVG = function (parents) {
                var e_1, _b;
                if (!this.breakCount) {
                    _super.prototype.toSVG.call(this, parents);
                    return;
                }
                var svg = this.standardSvgNodes(parents);
                var textNode = this.textNode.node;
                var childNodes = this.childNodes;
                try {
                    for (var _c = __values(svg.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var i = _d.value;
                        var DOM = [svg[i]];
                        var _e = __read(this.breakPoints[i - 1] || [0, 0], 2), si = _e[0], sj = _e[1];
                        var _f = __read(this.breakPoints[i] || [childNodes.length, 0], 2), ei = _f[0], ej = _f[1];
                        var words = childNodes[si].node.getText().split(/ /);
                        if (si === ei) {
                            textNode.setText(words.slice(sj, ej).join(' '));
                            this.textNode.toSVG(DOM);
                            continue;
                        }
                        textNode.setText(words.slice(sj).join(' '));
                        this.textNode.toSVG(DOM);
                        var x = this.textNode.getBBox().w;
                        while (++si < ei && si < childNodes.length) {
                            var child = childNodes[si];
                            child.toSVG(DOM);
                            if (child.dom) {
                                child.place(x, 0);
                            }
                            x += child.getBBox().w;
                        }
                        if (si < childNodes.length) {
                            words = childNodes[si].node.getText().split(/ /);
                            textNode.setText(words.slice(0, ej).join(' '));
                            this.textNode.toSVG(DOM);
                            this.textNode.place(x, 0);
                        }
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
            return SvgMtext;
        }(Base)),
        _a.kind = mtext_js_2.MmlMtext.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtext.js.map