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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.SvgFontData = void 0;
exports.AddPaths = AddPaths;
var FontData_js_1 = require("../common/FontData.js");
__exportStar(require("../common/FontData.js"), exports);
var SvgFontData = (function (_super) {
    __extends(SvgFontData, _super);
    function SvgFontData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SvgFontData.charOptions = function (font, n) {
        return _super.charOptions.call(this, font, n);
    };
    SvgFontData.addExtension = function (data, prefix) {
        if (prefix === void 0) { prefix = ''; }
        _super.addExtension.call(this, data, prefix);
        (0, FontData_js_1.mergeOptions)(this, 'variantCacheIds', data.cacheIds);
    };
    SvgFontData.OPTIONS = __assign(__assign({}, FontData_js_1.FontData.OPTIONS), { dynamicPrefix: './svg/dynamic' });
    SvgFontData.JAX = 'SVG';
    return SvgFontData;
}(FontData_js_1.FontData));
exports.SvgFontData = SvgFontData;
function AddPaths(font, paths, content) {
    var e_1, _a, e_2, _b;
    try {
        for (var _c = __values(Object.keys(paths)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var c = _d.value;
            var n = parseInt(c);
            SvgFontData.charOptions(font, n).p = paths[n];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var _e = __values(Object.keys(content)), _f = _e.next(); !_f.done; _f = _e.next()) {
            var c = _f.value;
            var n = parseInt(c);
            SvgFontData.charOptions(font, n).c = content[n];
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return font;
}
//# sourceMappingURL=FontData.js.map