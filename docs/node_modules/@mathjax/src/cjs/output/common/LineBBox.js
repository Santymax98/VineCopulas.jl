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
exports.LineBBox = void 0;
var BBox_js_1 = require("../../util/BBox.js");
var LineBBox = (function (_super) {
    __extends(LineBBox, _super);
    function LineBBox(def, start) {
        if (start === void 0) { start = null; }
        var _this = _super.call(this, def) || this;
        _this.indentData = null;
        _this.isFirst = false;
        _this.originalL = _this.L;
        if (start) {
            _this.start = start;
        }
        return _this;
    }
    LineBBox.from = function (bbox, leading, indent) {
        if (indent === void 0) { indent = null; }
        var nbox = new this();
        Object.assign(nbox, bbox);
        nbox.lineLeading = leading;
        if (indent) {
            nbox.indentData = indent;
        }
        return nbox;
    };
    LineBBox.prototype.append = function (cbox) {
        if (this.isFirst) {
            cbox.originalL += cbox.L;
            cbox.L = 0;
        }
        if (cbox.indentData) {
            this.indentData = cbox.indentData;
        }
        this.lineLeading = cbox.lineLeading;
        _super.prototype.append.call(this, cbox);
        this.isFirst = cbox.isFirst;
    };
    LineBBox.prototype.copy = function () {
        var bbox = LineBBox.from(this, this.lineLeading);
        bbox.indentData = this.indentData;
        bbox.lineLeading = this.lineLeading;
        return bbox;
    };
    LineBBox.prototype.getIndentData = function (node) {
        var _a = node.attributes.getAllAttributes(), indentalign = _a.indentalign, indentshift = _a.indentshift, indentalignfirst = _a.indentalignfirst, indentshiftfirst = _a.indentshiftfirst, indentalignlast = _a.indentalignlast, indentshiftlast = _a.indentshiftlast;
        if (indentalignfirst === 'indentalign') {
            indentalignfirst = node.attributes.getInherited('indentalign');
        }
        if (indentshiftfirst === 'indentshift') {
            indentshiftfirst = node.attributes.getInherited('indentshift');
        }
        if (indentalignlast === 'indentalign') {
            indentalignlast = indentalign;
        }
        if (indentshiftlast === 'indentshift') {
            indentshiftlast = indentshift;
        }
        this.indentData = [
            [indentalignfirst, indentshiftfirst],
            [indentalign, indentshift],
            [indentalignlast, indentshiftlast],
        ];
    };
    LineBBox.prototype.copyIndentData = function (bbox) {
        return bbox.indentData.map(function (_a) {
            var _b = __read(_a, 2), align = _b[0], indent = _b[1];
            return [align, indent];
        });
    };
    return LineBBox;
}(BBox_js_1.BBox));
exports.LineBBox = LineBBox;
//# sourceMappingURL=LineBBox.js.map