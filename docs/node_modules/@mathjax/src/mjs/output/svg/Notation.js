import * as Notation from '../common/Notation.js';
export * from '../common/Notation.js';
export const computeLineData = {
    top: (h, _d, w, t) => [0, h - t, w, h - t],
    right: (h, d, w, t) => [w - t, -d, w - t, h],
    bottom: (_h, d, w, t) => [0, t - d, w, t - d],
    left: (h, d, _w, t) => [t, -d, t, h],
    vertical: (h, d, w, _t) => [w / 2, h, w / 2, -d],
    horizontal: (h, d, w, _t) => [0, (h - d) / 2, w, (h - d) / 2],
    up: (h, d, w, t) => [t, t - d, w - t, h - t],
    down: (h, d, w, t) => [t, h - t, w - t, t - d],
};
export const lineData = function (node, kind, offset = '') {
    const { h, d, w } = node.getBBox();
    const t = node.thickness / 2;
    return lineOffset(computeLineData[kind](h, d, w, t), node, offset);
};
export const lineOffset = function (data, node, offset) {
    if (offset) {
        const d = node.getOffset(offset);
        if (d) {
            if (offset === 'X') {
                data[0] -= d;
                data[2] -= d;
            }
            else {
                data[1] -= d;
                data[3] -= d;
            }
        }
    }
    return data;
};
export const RenderLine = function (line, offset = '') {
    return (node, _child) => {
        const L = node.line(lineData(node, line, offset));
        node.adaptor.append(node.dom[0], L);
    };
};
export const Border = function (side) {
    return Notation.CommonBorder((node, _child) => {
        node.adaptor.append(node.dom[0], node.line(lineData(node, side)));
    })(side);
};
export const Border2 = function (name, side1, side2) {
    return Notation.CommonBorder2((node, _child) => {
        node.adaptor.append(node.dom[0], node.line(lineData(node, side1)));
        node.adaptor.append(node.dom[0], node.line(lineData(node, side2)));
    })(name, side1, side2);
};
export const DiagonalStrike = function (name) {
    return Notation.CommonDiagonalStrike((_cname) => (node, _child) => {
        node.adaptor.append(node.dom[0], node.line(lineData(node, name)));
    })(name);
};
export const DiagonalArrow = function (name) {
    return Notation.CommonDiagonalArrow((node, arrow) => {
        node.adaptor.append(node.dom[0], arrow);
    })(name);
};
export const Arrow = function (name) {
    return Notation.CommonArrow((node, arrow) => {
        node.adaptor.append(node.dom[0], arrow);
    })(name);
};
//# sourceMappingURL=Notation.js.map