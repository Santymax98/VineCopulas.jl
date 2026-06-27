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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
exports.MmlVisitor = void 0;
var SerializedMmlVisitor_js_1 = require("../../core/MmlTree/SerializedMmlVisitor.js");
var Options_js_1 = require("../../util/Options.js");
var MmlVisitor = (function (_super) {
    __extends(MmlVisitor, _super);
    function MmlVisitor() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.options = {
            filterSRE: true,
            filterTex: true,
            texHints: true,
            semantics: false,
        };
        _this.mathItem = null;
        return _this;
    }
    MmlVisitor.prototype.visitTree = function (node, math, options) {
        if (math === void 0) { math = null; }
        if (options === void 0) { options = {}; }
        this.mathItem = math;
        (0, Options_js_1.userOptions)(this.options, options);
        return this.visitNode(node, '');
    };
    MmlVisitor.prototype.visitTeXAtomNode = function (node, space) {
        if (this.options.texHints) {
            return _super.prototype.visitDefault.call(this, node, space);
        }
        if (node.childNodes[0] && node.childNodes[0].childNodes.length === 1) {
            return this.visitNode(node.childNodes[0], space);
        }
        return ("".concat(space, "<mrow").concat(this.getAttributes(node), ">\n") +
            this.childNodeMml(node, space + '  ', '\n') +
            "".concat(space, "</mrow>"));
    };
    MmlVisitor.prototype.visitMathNode = function (node, space) {
        if (!this.options.semantics || this.mathItem.inputJax.name !== 'TeX') {
            return _super.prototype.visitDefault.call(this, node, space);
        }
        var addRow = node.childNodes.length && node.childNodes[0].childNodes.length > 1;
        return ("".concat(space, "<math").concat(this.getAttributes(node), ">\n").concat(space, "  <semantics>\n") +
            (addRow ? space + '    <mrow>\n' : '') +
            this.childNodeMml(node, space + (addRow ? '      ' : '    '), '\n') +
            (addRow ? space + '    </mrow>\n' : '') +
            "".concat(space, "    <annotation encoding=\"application/x-tex\">") +
            this.mathItem.math +
            "</annotation>\n".concat(space, "  </semantics>\n").concat(space, "</math>"));
    };
    MmlVisitor.prototype.getAttributeList = function (node) {
        var e_1, _a;
        var list = _super.prototype.getAttributeList.call(this, node);
        if (this.options.filterTex) {
            delete list['data-latex'];
            delete list['data-latex-item'];
        }
        if (this.options.filterSRE) {
            var keys = Object.keys(list).filter(function (id) {
                return id.match(/^(?:data-semantic-.*?|data-speech-node|role|aria-(?:level|posinset|setsize|owns))$/);
            });
            try {
                for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                    var key = keys_1_1.value;
                    delete list[key];
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return list;
    };
    return MmlVisitor;
}(SerializedMmlVisitor_js_1.SerializedMmlVisitor));
exports.MmlVisitor = MmlVisitor;
//# sourceMappingURL=MmlVisitor.js.map