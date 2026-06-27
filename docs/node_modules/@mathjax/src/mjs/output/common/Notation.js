export const ARROWX = 4;
export const ARROWDX = 1;
export const ARROWY = 2;
export const THICKNESS = 0.067;
export const PADDING = 0.2;
export const SOLID = THICKNESS + 'em solid';
export const sideIndex = { top: 0, right: 1, bottom: 2, left: 3 };
export const sideNames = Object.keys(sideIndex);
export const fullBBox = ((node) => new Array(4).fill(node.thickness + node.padding));
export const fullPadding = ((node) => new Array(4).fill(node.padding));
export const fullBorder = ((node) => new Array(4).fill(node.thickness));
export const arrowHead = (node) => {
    return Math.max(node.padding, node.thickness * (node.arrowhead.x + node.arrowhead.dx + 1));
};
export const arrowBBoxHD = (node, TRBL) => {
    if (node.childNodes[0]) {
        const { h, d } = node.childNodes[0].getBBox();
        TRBL[0] = TRBL[2] = Math.max(0, node.thickness * node.arrowhead.y - (h + d) / 2);
    }
    return TRBL;
};
export const arrowBBoxW = (node, TRBL) => {
    if (node.childNodes[0]) {
        const { w } = node.childNodes[0].getBBox();
        TRBL[1] = TRBL[3] = Math.max(0, node.thickness * node.arrowhead.y - w / 2);
    }
    return TRBL;
};
export const arrowDef = {
    up: [-Math.PI / 2, false, true, 'verticalstrike'],
    down: [Math.PI / 2, false, true, 'verticakstrike'],
    right: [0, false, false, 'horizontalstrike'],
    left: [Math.PI, false, false, 'horizontalstrike'],
    updown: [Math.PI / 2, true, true, 'verticalstrike uparrow downarrow'],
    leftright: [0, true, false, 'horizontalstrike leftarrow rightarrow'],
};
export const diagonalArrowDef = {
    updiagonal: [-1, 0, false, 'updiagonalstrike northeastarrow'],
    northeast: [-1, 0, false, 'updiagonalstrike updiagonalarrow'],
    southeast: [1, 0, false, 'downdiagonalstrike'],
    northwest: [1, Math.PI, false, 'downdiagonalstrike'],
    southwest: [-1, Math.PI, false, 'updiagonalstrike'],
    northeastsouthwest: [
        -1,
        0,
        true,
        'updiagonalstrike northeastarrow updiagonalarrow southwestarrow',
    ],
    northwestsoutheast: [
        1,
        0,
        true,
        'downdiagonalstrike northwestarrow southeastarrow',
    ],
};
export const arrowBBox = {
    up: (node) => arrowBBoxW(node, [arrowHead(node), 0, node.padding, 0]),
    down: (node) => arrowBBoxW(node, [node.padding, 0, arrowHead(node), 0]),
    right: (node) => arrowBBoxHD(node, [0, arrowHead(node), 0, node.padding]),
    left: (node) => arrowBBoxHD(node, [0, node.padding, 0, arrowHead(node)]),
    updown: (node) => arrowBBoxW(node, [arrowHead(node), 0, arrowHead(node), 0]),
    leftright: (node) => arrowBBoxHD(node, [0, arrowHead(node), 0, arrowHead(node)]),
};
export const CommonBorder = function (render) {
    return (side) => {
        const i = sideIndex[side];
        return [
            side,
            {
                renderer: render,
                bbox: (node) => {
                    const bbox = [0, 0, 0, 0];
                    bbox[i] = node.thickness + node.padding;
                    return bbox;
                },
                border: (node) => {
                    const bbox = [0, 0, 0, 0];
                    bbox[i] = node.thickness;
                    return bbox;
                },
            },
        ];
    };
};
export const CommonBorder2 = function (render) {
    return (name, side1, side2) => {
        const i1 = sideIndex[side1];
        const i2 = sideIndex[side2];
        return [
            name,
            {
                renderer: render,
                bbox: (node) => {
                    const t = node.thickness + node.padding;
                    const bbox = [0, 0, 0, 0];
                    bbox[i1] = bbox[i2] = t;
                    return bbox;
                },
                border: (node) => {
                    const bbox = [0, 0, 0, 0];
                    bbox[i1] = bbox[i2] = node.thickness;
                    return bbox;
                },
                remove: side1 + ' ' + side2,
            },
        ];
    };
};
export const CommonDiagonalStrike = function (render) {
    return (name) => {
        const cname = 'mjx-' + name.charAt(0) + 'strike';
        return [
            name + 'diagonalstrike',
            {
                renderer: render(cname),
                bbox: fullBBox,
            },
        ];
    };
};
export const CommonDiagonalArrow = function (render) {
    return (name) => {
        const [c, pi, double, remove] = diagonalArrowDef[name];
        return [
            name + 'arrow',
            {
                renderer: (node, _child) => {
                    const [a, W] = node.arrowAW();
                    const arrow = node.arrow(W, c * (a - pi), double);
                    render(node, arrow);
                },
                bbox: (node) => {
                    const { a, x, y } = node.arrowData();
                    const [ax, ay, adx] = [
                        node.arrowhead.x,
                        node.arrowhead.y,
                        node.arrowhead.dx,
                    ];
                    const [b, ar] = node.getArgMod(ax + adx, ay);
                    const dy = y + (b > a ? node.thickness * ar * Math.sin(b - a) : 0);
                    const dx = x +
                        (b > Math.PI / 2 - a
                            ? node.thickness * ar * Math.sin(b + a - Math.PI / 2)
                            : 0);
                    return [dy, dx, dy, dx];
                },
                remove: remove,
            },
        ];
    };
};
export const CommonArrow = function (render) {
    return (name) => {
        const [angle, double, isVertical, remove] = arrowDef[name];
        return [
            name + 'arrow',
            {
                renderer: (node, _child) => {
                    const { w, h, d } = node.getBBox();
                    const [W, offset] = isVertical ? [h + d, 'X'] : [w, 'Y'];
                    const dd = node.getOffset(offset);
                    const arrow = node.arrow(W, angle, double, offset, dd);
                    render(node, arrow);
                },
                bbox: arrowBBox[name],
                remove: remove,
            },
        ];
    };
};
//# sourceMappingURL=Notation.js.map