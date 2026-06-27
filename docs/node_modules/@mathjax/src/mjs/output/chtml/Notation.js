import * as Notation from '../common/Notation.js';
export * from '../common/Notation.js';
export const RenderElement = function (name, offset = '') {
    return ((node, _child) => {
        const shape = node.adjustBorder(node.html('mjx-' + name));
        if (offset) {
            const d = node.getOffset(offset);
            if (node.thickness !== Notation.THICKNESS || d) {
                const transform = `translate${offset}(${node.Em(node.thickness / 2 - d)})`;
                node.adaptor.setStyle(shape, 'transform', transform);
            }
        }
        node.adaptor.append(node.dom[0], shape);
    });
};
export const Border = function (side) {
    return Notation.CommonBorder((node, child) => {
        node.adaptor.setStyle(child, 'border-' + side, node.Em(node.thickness) + ' solid');
    })(side);
};
export const Border2 = function (name, side1, side2) {
    return Notation.CommonBorder2((node, child) => {
        const border = node.Em(node.thickness) + ' solid';
        node.adaptor.setStyle(child, 'border-' + side1, border);
        node.adaptor.setStyle(child, 'border-' + side2, border);
    })(name, side1, side2);
};
export const DiagonalStrike = function (name, neg) {
    return Notation.CommonDiagonalStrike((cname) => (node, _child) => {
        const { w, h, d } = node.getBBox();
        const [a, W] = node.getArgMod(w, h + d);
        const t = (neg * node.thickness) / 2;
        const strike = node.adjustBorder(node.html(cname, {
            style: {
                width: node.Em(W),
                transform: 'rotate(' + node.fixed(-neg * a) + 'rad) translateY(' + t + 'em)',
            },
        }));
        node.adaptor.append(node.dom[0], strike);
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