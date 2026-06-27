"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortLength = sortLength;
exports.quotePattern = quotePattern;
exports.unicodeChars = unicodeChars;
exports.unicodeString = unicodeString;
exports.isPercent = isPercent;
exports.split = split;
exports.replaceUnicode = replaceUnicode;
exports.toEntity = toEntity;
function sortLength(a, b) {
    return a.length !== b.length
        ? b.length - a.length
        : a === b
            ? 0
            : a < b
                ? -1
                : 1;
}
function quotePattern(text) {
    return text.replace(/([\^$(){}.+*?\-|[\]:\\])/g, '\\$1');
}
function unicodeChars(text) {
    return Array.from(text).map(function (c) { return c.codePointAt(0); });
}
function unicodeString(data) {
    return String.fromCodePoint.apply(String, __spreadArray([], __read(data), false));
}
function isPercent(x) {
    return !!x.match(/%\s*$/);
}
function split(x) {
    return x.trim().split(/\s+/);
}
function replaceUnicode(text) {
    return text.replace(/\\U(?:([0-9A-Fa-f]{4})|\{\s*([0-9A-Fa-f]{1,6})\s*\})|\\./g, function (m, h1, h2) {
        return m === '\\\\' ? '\\' : String.fromCodePoint(parseInt(h1 || h2, 16));
    });
}
function toEntity(c) {
    return "&#x".concat(c.codePointAt(0).toString(16).toUpperCase(), ";");
}
//# sourceMappingURL=string.js.map