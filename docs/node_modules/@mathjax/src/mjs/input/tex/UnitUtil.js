class UnitMap {
    constructor(map) {
        this.num = '([-+]?([.,]\\d+|\\d+([.,]\\d*)?))';
        this.unit = '';
        this.dimenEnd = /./;
        this.dimenRest = /./;
        this.map = new Map(map);
        this.updateDimen();
    }
    updateDimen() {
        this.unit = `(${Array.from(this.map.keys()).join('|')})`;
        this.dimenEnd = RegExp('^\\s*' + this.num + '\\s*' + this.unit + '\\s*$');
        this.dimenRest = RegExp('^\\s*' + this.num + '\\s*' + this.unit + ' ?');
    }
    set(name, ems) {
        this.map.set(name, ems);
        this.updateDimen();
        return this;
    }
    get(name) {
        return this.map.get(name) || this.map.get('pt');
    }
    delete(name) {
        if (this.map.delete(name)) {
            this.updateDimen();
            return true;
        }
        return false;
    }
}
const emPerInch = 7.2;
const pxPerInch = 72;
function muReplace([value, unit, length]) {
    if (unit !== 'mu') {
        return [value, unit, length];
    }
    const em = UnitUtil.em(UnitUtil.UNIT_CASES.get(unit) * parseFloat(value));
    return [em.slice(0, -2), 'em', length];
}
export const UnitUtil = {
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
    matchDimen(dim, rest = false) {
        const match = dim.match(rest ? UnitUtil.UNIT_CASES.dimenRest : UnitUtil.UNIT_CASES.dimenEnd);
        return match
            ? muReplace([match[1].replace(/,/, '.'), match[4], match[0].length])
            : [null, null, 0];
    },
    dimen2em(dim) {
        const [value, unit] = UnitUtil.matchDimen(dim);
        const m = parseFloat(value || '1');
        const factor = UnitUtil.UNIT_CASES.get(unit);
        return factor * m;
    },
    em(m) {
        if (Math.abs(m) < 0.0006) {
            return '0em';
        }
        return m.toFixed(3).replace(/\.?0+$/, '') + 'em';
    },
    trimSpaces(text) {
        if (typeof text !== 'string') {
            return text;
        }
        let TEXT = text.trim();
        if (TEXT.match(/\\$/) && text.match(/ $/)) {
            TEXT += ' ';
        }
        return TEXT;
    },
};
//# sourceMappingURL=UnitUtil.js.map