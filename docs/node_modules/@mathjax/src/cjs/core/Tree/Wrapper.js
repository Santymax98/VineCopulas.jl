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
exports.AbstractWrapper = void 0;
var AbstractWrapper = (function () {
    function AbstractWrapper(factory, node) {
        this.factory = factory;
        this.node = node;
    }
    Object.defineProperty(AbstractWrapper.prototype, "kind", {
        get: function () {
            return this.node.kind;
        },
        enumerable: false,
        configurable: true
    });
    AbstractWrapper.prototype.wrap = function (node) {
        return this.factory.wrap(node);
    };
    AbstractWrapper.prototype.walkTree = function (func, data) {
        var e_1, _a;
        func(this, data);
        if ('childNodes' in this) {
            try {
                for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    if (child) {
                        child.walkTree(func, data);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return data;
    };
    return AbstractWrapper;
}());
exports.AbstractWrapper = AbstractWrapper;
//# sourceMappingURL=Wrapper.js.map