export function sortLength(a, b) {
    return a.length !== b.length
        ? b.length - a.length
        : a === b
            ? 0
            : a < b
                ? -1
                : 1;
}
export function quotePattern(text) {
    return text.replace(/([\^$(){}.+*?\-|[\]:\\])/g, '\\$1');
}
export function unicodeChars(text) {
    return Array.from(text).map((c) => c.codePointAt(0));
}
export function unicodeString(data) {
    return String.fromCodePoint(...data);
}
export function isPercent(x) {
    return !!x.match(/%\s*$/);
}
export function split(x) {
    return x.trim().split(/\s+/);
}
export function replaceUnicode(text) {
    return text.replace(/\\U(?:([0-9A-Fa-f]{4})|\{\s*([0-9A-Fa-f]{1,6})\s*\})|\\./g, (m, h1, h2) => m === '\\\\' ? '\\' : String.fromCodePoint(parseInt(h1 || h2, 16)));
}
export function toEntity(c) {
    return `&#x${c.codePointAt(0).toString(16).toUpperCase()};`;
}
//# sourceMappingURL=string.js.map