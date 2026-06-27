import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMencloseMixin, } from '../../common/Wrappers/menclose.js';
import { MmlMenclose } from '../../../core/MmlTree/MmlNodes/menclose.js';
import * as Notation from '../Notation.js';
import { em } from '../../../util/lengths.js';
function Angle(x, y) {
    return Math.atan2(x, y)
        .toFixed(3)
        .replace(/\.?0+$/, '');
}
const ANGLE = Angle(Notation.ARROWDX, Notation.ARROWY);
export const ChtmlMenclose = (function () {
    var _a;
    const Base = CommonMencloseMixin(ChtmlWrapper);
    return _a = class ChtmlMenclose extends Base {
            adjustArrow(arrow, double) {
                const t = this.thickness;
                const head = this.arrowhead;
                if (head.x === Notation.ARROWX &&
                    head.y === Notation.ARROWY &&
                    head.dx === Notation.ARROWDX &&
                    t === Notation.THICKNESS)
                    return;
                const [x, y] = [t * head.x, t * head.y].map((x) => this.em(x));
                const a = Angle(head.dx, head.y);
                const [line, rthead, rbhead, lthead, lbhead] = this.adaptor.childNodes(arrow);
                this.adjustHead(rthead, [y, '0', '1px', x], a);
                this.adjustHead(rbhead, ['1px', '0', y, x], '-' + a);
                this.adjustHead(lthead, [y, x, '1px', '0'], '-' + a);
                this.adjustHead(lbhead, ['1px', x, y, '0'], a);
                this.adjustLine(line, t, head.x, double);
            }
            adjustHead(head, border, a) {
                if (head) {
                    this.adaptor.setStyle(head, 'border-width', border.join(' '));
                    this.adaptor.setStyle(head, 'transform', 'skewX(' + a + 'rad)');
                }
            }
            adjustLine(line, t, x, double) {
                this.adaptor.setStyle(line, 'borderTop', this.em(t) + ' solid');
                this.adaptor.setStyle(line, 'top', this.em(-t / 2));
                this.adaptor.setStyle(line, 'right', this.em(t * (x - 1)));
                if (double) {
                    this.adaptor.setStyle(line, 'left', this.em(t * (x - 1)));
                }
            }
            moveArrow(arrow, offset, d) {
                if (!d)
                    return;
                const transform = this.adaptor.getStyle(arrow, 'transform');
                this.adaptor.setStyle(arrow, 'transform', `translate${offset}(${this.em(-d)})${transform ? ' ' + transform : ''}`);
            }
            adjustBorder(node) {
                if (this.thickness !== Notation.THICKNESS) {
                    this.adaptor.setStyle(node, 'borderWidth', this.em(this.thickness));
                }
                return node;
            }
            adjustThickness(shape) {
                if (this.thickness !== Notation.THICKNESS) {
                    this.adaptor.setStyle(shape, 'strokeWidth', this.fixed(this.thickness));
                }
                return shape;
            }
            fixed(m, n = 3) {
                if (Math.abs(m) < 0.0006) {
                    return '0';
                }
                return m.toFixed(n).replace(/\.?0+$/, '');
            }
            Em(m) {
                return super.em(m);
            }
            toCHTML(parents) {
                const adaptor = this.adaptor;
                const chtml = this.standardChtmlNodes(parents);
                const block = adaptor.append(chtml[0], this.html('mjx-box'));
                if (this.renderChild) {
                    this.renderChild(this, block);
                }
                else {
                    this.childNodes[0].toCHTML([block]);
                }
                for (const name of Object.keys(this.notations)) {
                    const notation = this.notations[name];
                    if (!notation.renderChild) {
                        notation.renderer(this, block);
                    }
                }
                const pbox = this.getPadding();
                for (const name of Notation.sideNames) {
                    const i = Notation.sideIndex[name];
                    if (pbox[i] > 0) {
                        adaptor.setStyle(block, 'padding-' + name, this.em(pbox[i]));
                    }
                }
            }
            arrow(w, a, double, offset = '', dist = 0) {
                const W = this.getBBox().w;
                const style = { width: this.em(w) };
                if (W !== w) {
                    style.left = this.em((W - w) / 2);
                }
                if (a) {
                    style.transform = 'rotate(' + this.fixed(a) + 'rad)';
                }
                const arrow = this.html('mjx-arrow', { style: style }, [
                    this.html('mjx-aline'),
                    this.html('mjx-rthead'),
                    this.html('mjx-rbhead'),
                ]);
                if (double) {
                    this.adaptor.append(arrow, this.html('mjx-lthead'));
                    this.adaptor.append(arrow, this.html('mjx-lbhead'));
                    this.adaptor.setAttribute(arrow, 'double', 'true');
                }
                this.adjustArrow(arrow, double);
                this.moveArrow(arrow, offset, dist);
                return arrow;
            }
        },
        _a.kind = MmlMenclose.prototype.kind,
        _a.styles = {
            'mjx-menclose': {
                position: 'relative',
            },
            'mjx-menclose > mjx-dstrike': {
                display: 'inline-block',
                left: 0,
                top: 0,
                position: 'absolute',
                'border-top': Notation.SOLID,
                'transform-origin': 'top left',
            },
            'mjx-menclose > mjx-ustrike': {
                display: 'inline-block',
                left: 0,
                bottom: 0,
                position: 'absolute',
                'border-top': Notation.SOLID,
                'transform-origin': 'bottom left',
            },
            'mjx-menclose > mjx-hstrike': {
                'border-top': Notation.SOLID,
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '50%',
                transform: 'translateY(' + em(Notation.THICKNESS / 2) + ')',
            },
            'mjx-menclose > mjx-vstrike': {
                'border-left': Notation.SOLID,
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: '50%',
                transform: 'translateX(' + em(Notation.THICKNESS / 2) + ')',
            },
            'mjx-menclose > mjx-rbox': {
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                border: Notation.SOLID,
                'border-radius': em(Notation.THICKNESS + Notation.PADDING),
            },
            'mjx-menclose > mjx-cbox': {
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                border: Notation.SOLID,
                'border-radius': '50%',
            },
            'mjx-menclose > mjx-arrow': {
                position: 'absolute',
                left: 0,
                bottom: '50%',
                height: 0,
                width: 0,
            },
            'mjx-menclose > mjx-arrow > mjx-aline': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                'transform-origin': 'bottom',
                left: 0,
                top: em(-Notation.THICKNESS / 2),
                right: em(Notation.THICKNESS * (Notation.ARROWX - 1)),
                height: 0,
                'border-top': em(Notation.THICKNESS) + ' solid',
                'border-left': 0,
                'border-right': 0,
            },
            'mjx-menclose > mjx-arrow[double] > mjx-aline': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                'transform-origin': 'bottom',
                left: em(Notation.THICKNESS * (Notation.ARROWX - 1)),
                height: 0,
                'border-left': em(Notation.THICKNESS * Notation.ARROWX) + ' solid',
                'border-right': 0,
            },
            'mjx-menclose > mjx-arrow > mjx-rthead': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                'transform-origin': 'bottom',
                transform: 'skewX(' + ANGLE + 'rad)',
                right: 0,
                bottom: '-1px',
                'border-left': em(Notation.THICKNESS * Notation.ARROWX) + ' solid',
                'border-right': 0,
                'border-bottom': '1px solid transparent',
                'border-top': em(Notation.THICKNESS * Notation.ARROWY) + ' solid transparent',
            },
            'mjx-menclose > mjx-arrow > mjx-rbhead': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                transform: 'skewX(-' + ANGLE + 'rad)',
                'transform-origin': 'top',
                right: 0,
                top: '-1px',
                'border-left': em(Notation.THICKNESS * Notation.ARROWX) + ' solid',
                'border-right': 0,
                'border-top': '1px solid transparent',
                'border-bottom': em(Notation.THICKNESS * Notation.ARROWY) + ' solid transparent',
            },
            'mjx-menclose > mjx-arrow > mjx-lthead': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                transform: 'skewX(-' + ANGLE + 'rad)',
                'transform-origin': 'bottom',
                left: 0,
                bottom: '-1px',
                'border-left': 0,
                'border-right': em(Notation.THICKNESS * Notation.ARROWX) + ' solid',
                'border-bottom': '1px solid transparent',
                'border-top': em(Notation.THICKNESS * Notation.ARROWY) + ' solid transparent',
            },
            'mjx-menclose > mjx-arrow > mjx-lbhead': {
                display: 'block',
                position: 'absolute',
                'box-sizing': 'border-box',
                transform: 'skewX(' + ANGLE + 'rad)',
                'transform-origin': 'top',
                left: 0,
                top: '-1px',
                'border-left': 0,
                'border-right': em(Notation.THICKNESS * Notation.ARROWX) + ' solid',
                'border-top': '1px solid transparent',
                'border-bottom': em(Notation.THICKNESS * Notation.ARROWY) + ' solid transparent',
            },
            'mjx-menclose > mjx-dbox-top': {
                position: 'absolute',
                top: 0,
                bottom: '50%',
                left: 0,
                width: em(1.5 * Notation.PADDING),
                'border-width': em(Notation.THICKNESS),
                'border-style': 'solid solid none none',
                'border-radius': '0 100% 0 0',
                'box-sizing': 'border-box',
            },
            'mjx-menclose > mjx-dbox-bot': {
                position: 'absolute',
                top: '50%',
                bottom: 0,
                left: 0,
                width: em(1.5 * Notation.PADDING),
                'border-width': em(Notation.THICKNESS),
                'border-style': 'none solid solid none',
                'border-radius': '0 0 100% 0',
                'box-sizing': 'border-box',
            },
        },
        _a.notations = new Map([
            Notation.Border('top'),
            Notation.Border('right'),
            Notation.Border('bottom'),
            Notation.Border('left'),
            Notation.Border2('actuarial', 'top', 'right'),
            Notation.Border2('madruwb', 'bottom', 'right'),
            Notation.DiagonalStrike('up', 1),
            Notation.DiagonalStrike('down', -1),
            [
                'horizontalstrike',
                {
                    renderer: Notation.RenderElement('hstrike', 'Y'),
                    bbox: (node) => [0, node.padding, 0, node.padding],
                },
            ],
            [
                'verticalstrike',
                {
                    renderer: Notation.RenderElement('vstrike', 'X'),
                    bbox: (node) => [node.padding, 0, node.padding, 0],
                },
            ],
            [
                'box',
                {
                    renderer: (node, child) => {
                        node.adaptor.setStyle(child, 'border', node.Em(node.thickness) + ' solid');
                    },
                    bbox: Notation.fullBBox,
                    border: Notation.fullBorder,
                    remove: 'left right top bottom',
                },
            ],
            [
                'roundedbox',
                {
                    renderer: Notation.RenderElement('rbox'),
                    bbox: Notation.fullBBox,
                },
            ],
            [
                'circle',
                {
                    renderer: Notation.RenderElement('cbox'),
                    bbox: Notation.fullBBox,
                },
            ],
            [
                'phasorangle',
                {
                    renderer: (node, child) => {
                        const { h, d } = node.getBBox();
                        const [a, W] = node.getArgMod(1.75 * node.padding, h + d);
                        const t = node.thickness * Math.sin(a) * 0.9;
                        node.adaptor.setStyle(child, 'border-bottom', node.Em(node.thickness) + ' solid');
                        const strike = node.adjustBorder(node.html('mjx-ustrike', {
                            style: {
                                width: node.Em(W),
                                transform: `translateX(${node.Em(t)}) rotate(${node.fixed(-a)}rad)`,
                            },
                        }));
                        node.adaptor.append(node.dom[0], strike);
                    },
                    bbox: (node) => {
                        const p = node.padding / 2;
                        const t = node.thickness;
                        return [2 * p, p, p + t, 3 * p + t];
                    },
                    border: (node) => [0, 0, node.thickness, 0],
                    remove: 'bottom',
                },
            ],
            Notation.Arrow('up'),
            Notation.Arrow('down'),
            Notation.Arrow('left'),
            Notation.Arrow('right'),
            Notation.Arrow('updown'),
            Notation.Arrow('leftright'),
            Notation.DiagonalArrow('updiagonal'),
            Notation.DiagonalArrow('northeast'),
            Notation.DiagonalArrow('southeast'),
            Notation.DiagonalArrow('northwest'),
            Notation.DiagonalArrow('southwest'),
            Notation.DiagonalArrow('northeastsouthwest'),
            Notation.DiagonalArrow('northwestsoutheast'),
            [
                'longdiv',
                {
                    renderer: (node, child) => {
                        const adaptor = node.adaptor;
                        adaptor.setStyle(child, 'border-top', node.Em(node.thickness) + ' solid');
                        const arc1 = adaptor.append(node.dom[0], node.html('mjx-dbox-top'));
                        const arc2 = adaptor.append(node.dom[0], node.html('mjx-dbox-bot'));
                        const t = node.thickness;
                        const p = node.padding;
                        if (t !== Notation.THICKNESS) {
                            adaptor.setStyle(arc1, 'border-width', node.Em(t));
                            adaptor.setStyle(arc2, 'border-width', node.Em(t));
                        }
                        if (p !== Notation.PADDING) {
                            adaptor.setStyle(arc1, 'width', node.Em(1.5 * p));
                            adaptor.setStyle(arc2, 'width', node.Em(1.5 * p));
                        }
                    },
                    bbox: (node) => {
                        const p = node.padding;
                        const t = node.thickness;
                        return [p + t, p, p, 2 * p + t / 2];
                    },
                },
            ],
            [
                'radical',
                {
                    renderer: (node, child) => {
                        node.msqrt.toCHTML([child]);
                        const TRBL = node.sqrtTRBL();
                        node.adaptor.setStyle(node.msqrt.dom[0], 'margin', TRBL.map((x) => node.Em(-x)).join(' '));
                    },
                    init: (node) => {
                        node.msqrt = node.createMsqrt(node.childNodes[0]);
                    },
                    bbox: (node) => node.sqrtTRBL(),
                    renderChild: true,
                },
            ],
        ]),
        _a;
})();
//# sourceMappingURL=menclose.js.map