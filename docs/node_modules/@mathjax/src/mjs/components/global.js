import { VERSION } from './version.js';
const defaultGlobal = {};
export const GLOBAL = (() => {
    if (typeof window !== 'undefined')
        return window;
    if (typeof global !== 'undefined')
        return global;
    if (typeof globalThis !== 'undefined')
        return globalThis;
    return defaultGlobal;
})();
export function isObject(x) {
    return typeof x === 'object' && x !== null;
}
export function combineConfig(dst, src, check = false) {
    var _a;
    for (const id of Object.keys(src)) {
        if (id === '__esModule' ||
            dst[id] === src[id] ||
            src[id] === null ||
            src[id] === undefined) {
            continue;
        }
        if (isObject(dst[id]) && isObject(src[id])) {
            combineConfig(dst[id], src[id], check || id === '_');
        }
        else if (!check || !((_a = Object.getOwnPropertyDescriptor(dst, id)) === null || _a === void 0 ? void 0 : _a.get)) {
            dst[id] = src[id];
        }
    }
    return dst;
}
export function combineDefaults(dst, name, src) {
    if (!dst[name]) {
        dst[name] = {};
    }
    dst = dst[name];
    for (const id of Object.keys(src)) {
        if (isObject(dst[id]) && isObject(src[id])) {
            combineDefaults(dst, id, src[id]);
        }
        else if (dst[id] == null && src[id] != null) {
            dst[id] = src[id];
        }
    }
    return dst;
}
export function combineWithMathJax(config) {
    return combineConfig(MathJax, config);
}
if (typeof GLOBAL.MathJax === 'undefined' ||
    GLOBAL.MathJax.constructor !== {}.constructor) {
    GLOBAL.MathJax = {};
}
if (!GLOBAL.MathJax.version) {
    GLOBAL.MathJax = {
        version: VERSION,
        _: {},
        config: GLOBAL.MathJax,
    };
}
export const MathJax = GLOBAL.MathJax;
//# sourceMappingURL=global.js.map