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
exports.AddFontIds = AddFontIds;
function AddFontIds(ranges, prefix) {
    var e_1, _a, e_2, _b, e_3, _c;
    var variants = {};
    try {
        for (var _d = __values(Object.keys(ranges)), _e = _d.next(); !_e.done; _e = _d.next()) {
            var id = _e.value;
            var map = ranges[id];
            try {
                for (var _f = (e_2 = void 0, __values(Object.keys(map))), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var variant = _g.value;
                    if (!variants[variant]) {
                        variants[variant] = {};
                    }
                    var chars = map[variant];
                    if (id) {
                        try {
                            for (var _h = (e_3 = void 0, __values(Object.keys(chars))), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var c = _j.value;
                                var data = chars[parseInt(c)];
                                if (!data[3]) {
                                    data[3] = {};
                                }
                                if (prefix) {
                                    data[3].ff = prefix + '-' + id;
                                }
                                else {
                                    data[3].f = id;
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                    Object.assign(variants[variant], chars);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return variants;
}
//# sourceMappingURL=DynamicFonts.js.map