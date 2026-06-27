export const BIGDIMEN = 1000000;
export const UNITS = {
    px: 1,
    'in': 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4
};
export const RELUNITS = {
    em: 1,
    ex: .431,
    pt: 1 / 10,
    pc: 12 / 10,
    mu: 1 / 18
};
export const MATHSPACE = {
    veryverythinmathspace: 1 / 18,
    verythinmathspace: 2 / 18,
    thinmathspace: 3 / 18,
    mediummathspace: 4 / 18,
    thickmathspace: 5 / 18,
    verythickmathspace: 6 / 18,
    veryverythickmathspace: 7 / 18,
    negativeveryverythinmathspace: -1 / 18,
    negativeverythinmathspace: -2 / 18,
    negativethinmathspace: -3 / 18,
    negativemediummathspace: -4 / 18,
    negativethickmathspace: -5 / 18,
    negativeverythickmathspace: -6 / 18,
    negativeveryverythickmathspace: -7 / 18,
    thin: .04,
    medium: .06,
    thick: .1,
    normal: 1,
    big: 2,
    small: 1 / Math.sqrt(2),
    infinity: BIGDIMEN
};
export function length2em(length, size = 0, scale = 1, em = 16) {
    if (typeof length !== 'string') {
        length = String(length);
    }
    if (length === '' || length == null) {
        return size;
    }
    if (MATHSPACE[length]) {
        return MATHSPACE[length];
    }
    const match = length.match(/^\s*([-+]?(?:\.\d+|\d+(?:\.\d*)?))?(pt|em|ex|mu|px|pc|in|mm|cm|%)?/);
    if (!match || match[0] === '') {
        return size;
    }
    const m = parseFloat(match[1] || '1');
    const unit = match[2];
    if (Object.hasOwn(UNITS, unit)) {
        return (m * UNITS[unit]) / em / scale;
    }
    if (Object.hasOwn(RELUNITS, unit)) {
        return m * RELUNITS[unit];
    }
    if (unit === '%') {
        return (m / 100) * size;
    }
    return m * size;
}
export function percent(m) {
    return (100 * m).toFixed(1).replace(/\.?0+$/, '') + '%';
}
export function em(m) {
    if (Math.abs(m) < 0.001)
        return '0';
    return m.toFixed(3).replace(/\.?0+$/, '') + 'em';
}
export function px(m, M = -BIGDIMEN, em = 16) {
    m *= em;
    if (M && m < M)
        m = M;
    if (Math.abs(m) < 0.1)
        return '0';
    return m.toFixed(1).replace(/\.0$/, '') + 'px';
}
//# sourceMappingURL=lengths.js.map