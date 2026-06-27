"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = sum;
exports.max = max;
function sum(A) {
    return A.reduce(function (a, b) { return a + b; }, 0);
}
function max(A) {
    return A.reduce(function (a, b) { return Math.max(a, b); }, 0);
}
//# sourceMappingURL=numeric.js.map