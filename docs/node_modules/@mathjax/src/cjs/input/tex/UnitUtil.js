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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitUtil = void 0;
var UnitMap = (function () {
    function UnitMap(map) {
        this.num = '([-+]?([.,]\\d+|\\d+([.,]\\d*)?))';
        this.unit = '';
        this.dimenEnd = /./;
        this.dimenRest = /./;
        this.map = new Map(map);
        this.updateDimen();
    }
    UnitMap.prototype.updateDimen = function () {
        this.unit = "(".concat(Array.from(this.map.keys()).join('|'), ")");
        this.dimenEnd = RegExp('^\\s*' + this.num + '\\s*' + this.unit + '\\s*$');
        this.dimenRest = RegExp('^\\s*' + this.num + '\\s*' + this.unit + ' ?');
    };
    UnitMap.prototype.set = function (name, ems) {
        this.map.set(name, ems);
        this.updateDimen();
        return this;
    };
    UnitMap.prototype.get = function (name) {
        return this.map.get(name) || this.map.get('pt');
    };
    UnitMap.prototype.delete = function (name) {
        if (this.map.delete(name)) {
            this.updateDimen();
            return true;
        }
        return false;
    };
    return UnitMap;
}());
var emPerInch = 7.2;
var pxPerInch = 72;
function muReplace(_a) {
    var _b = __read(_a, 3), value = _b[0], unit = _b[1], length = _b[2];
    if (unit !== 'mu') {
        return [value, unit, length];
    }
    var em = exports.UnitUtil.em(exports.UnitUtil.UNIT_CASES.get(unit) * parseFloat(value));
    return [em.slice(0, -2), 'em', length];
}
exports.UnitUtil = {
    UNIT_CASES: new UnitMap([
        ['em', 1],
        ['ex', .43],
        ['pt', 1 / 10],
        ['pc', 1.2],
        ['px', emPerInch / pxPerInch],
        ['in', emPerInch],
        ['cm', emPerInch / 2.54],
        ['mm', emPerInch / 25.4],
        ['mu', 1 / 18],
    ]),
    matchDimen: function (dim, rest) {
        if (rest === void 0) { rest = false; }
        var match = dim.match(rest ? exports.UnitUtil.UNIT_CASES.dimenRest : exports.UnitUtil.UNIT_CASES.dimenEnd);
        return match
            ? muReplace([match[1].replace(/,/, '.'), match[4], match[0].length])
            : [null, null, 0];
    },
    dimen2em: function (dim) {
        var _a = __read(exports.UnitUtil.matchDimen(dim), 2), value = _a[0], unit = _a[1];
        var m = parseFloat(value || '1');
        var factor = exports.UnitUtil.UNIT_CASES.get(unit);
        return factor * m;
    },
    em: function (m) {
        if (Math.abs(m) < 0.0006) {
            return '0em';
        }
        return m.toFixed(3).replace(/\.?0+$/, '') + 'em';
    },
    trimSpaces: function (text) {
        if (typeof text !== 'string') {
            return text;
        }
        var TEXT = text.trim();
        if (TEXT.match(/\\$/) && text.match(/ $/)) {
            TEXT += ' ';
        }
        return TEXT;
    },
};
//# sourceMappingURL=UnitUtil.js.map