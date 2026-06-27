"use strict";
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
exports.MathJax = exports.GLOBAL = void 0;
exports.isObject = isObject;
exports.combineConfig = combineConfig;
exports.combineDefaults = combineDefaults;
exports.combineWithMathJax = combineWithMathJax;
var version_js_1 = require("./version.js");
var defaultGlobal = {};
exports.GLOBAL = (function () {
    if (typeof window !== 'undefined')
        return window;
    if (typeof global !== 'undefined')
        return global;
    if (typeof globalThis !== 'undefined')
        return globalThis;
    return defaultGlobal;
})();
function isObject(x) {
    return typeof x === 'object' && x !== null;
}
function combineConfig(dst, src, check) {
    var e_1, _a;
    var _b;
    if (check === void 0) { check = false; }
    try {
        for (var _c = __values(Object.keys(src)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var id = _d.value;
            if (id === '__esModule' ||
                dst[id] === src[id] ||
                src[id] === null ||
                src[id] === undefined) {
                continue;
            }
            if (isObject(dst[id]) && isObject(src[id])) {
                combineConfig(dst[id], src[id], check || id === '_');
            }
            else if (!check || !((_b = Object.getOwnPropertyDescriptor(dst, id)) === null || _b === void 0 ? void 0 : _b.get)) {
                dst[id] = src[id];
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return dst;
}
function combineDefaults(dst, name, src) {
    var e_2, _a;
    if (!dst[name]) {
        dst[name] = {};
    }
    dst = dst[name];
    try {
        for (var _b = __values(Object.keys(src)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var id = _c.value;
            if (isObject(dst[id]) && isObject(src[id])) {
                combineDefaults(dst, id, src[id]);
            }
            else if (dst[id] == null && src[id] != null) {
                dst[id] = src[id];
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return dst;
}
function combineWithMathJax(config) {
    return combineConfig(exports.MathJax, config);
}
if (typeof exports.GLOBAL.MathJax === 'undefined' ||
    exports.GLOBAL.MathJax.constructor !== {}.constructor) {
    exports.GLOBAL.MathJax = {};
}
if (!exports.GLOBAL.MathJax.version) {
    exports.GLOBAL.MathJax = {
        version: version_js_1.VERSION,
        _: {},
        config: exports.GLOBAL.MathJax,
    };
}
exports.MathJax = exports.GLOBAL.MathJax;
//# sourceMappingURL=global.js.map