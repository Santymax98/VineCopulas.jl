import { SvgWrapper } from '../Wrapper.js';
import { CommonMencloseMixin, } from '../../common/Wrappers/menclose.js';
import { MmlMenclose } from '../../../core/MmlTree/MmlNodes/menclose.js';
import * as Notation from '../Notation.js';
export const SvgMenclose = (function () {
    var _a;
    const Base = CommonMencloseMixin(SvgWrapper);
    return _a = class SvgMenclose extends Base {
            line(pq) {
                const [x1, y1, x2, y2] = pq;
                return this.svg('line', {
                    x1: this.fixed(x1),
                    y1: this.fixed(y1),
                    x2: this.fixed(x2),
                    y2: this.fixed(y2),
                    'stroke-width': this.fixed(this.thickness),
                });
            }
            box(w, h, d, r = 0) {
                const t = this.thickness;
                const def = {
                    x: this.fixed(t / 2),
                    y: this.fixed(t / 2 - d),
                    width: this.fixed(w - t),
                    height: this.fixed(h + d - t),
                    fill: 'none',
                    'stroke-width': this.fixed(t),
                };
                if (r) {
                    def.rx = this.fixed(r);
                }
                return this.svg('rect', def);
            }
            ellipse(w, h, d) {
                const t = this.thickness;
                return this.svg('ellipse', {
                    rx: this.fixed((w - t) / 2),
                    ry: this.fixed((h + d - t) / 2),
                    cx: this.fixed(w / 2),
                    cy: this.fixed((h - d) / 2),
                    fill: 'none',
                    'stroke-width': this.fixed(t),
                });
            }
            path(join, ...P) {
                return this.svg('path', {
                    d: P.map((x) => (typeof x === 'string' ? x : this.fixed(x))).join(' '),
                    style: { 'stroke-width': this.fixed(this.thickness) },
                    'stroke-linecap': 'round',
                    'stroke-linejoin': join,
                    fill: 'none',
                });
            }
            fill(...P) {
                return this.svg('path', {
                    d: P.map((x) => (typeof x === 'string' ? x : this.fixed(x))).join(' '),
                });
            }
            arrow(W, a, double, offset = '', dist = 0) {
                const { w, h, d } = this.getBBox();
                const dw = (W - w) / 2;
                const m = (h - d) / 2;
                const t = this.thickness;
                const t2 = t / 2;
                const [x, y, dx] = [t * this.arrowhead.x, t * this.arrowhead.y, t * this.arrowhead.dx];
                const arrow = (double ?
                    this.fill('M', w + dw, m, 'l', -(x + dx), y, 'l', dx, t2 - y, 'L', x - dw, m + t2, 'l', dx, y - t2, 'l', -(x + dx), -y, 'l', x + dx, -y, 'l', -dx, y - t2, 'L', w + dw - x, m - t2, 'l', -dx, t2 - y, 'Z') :
                    this.fill('M', w + dw, m, 'l', -(x + dx), y, 'l', dx, t2 - y, 'L', -dw, m + t2, 'l', 0, -t, 'L', w + dw - x, m - t2, 'l', -dx, t2 - y, 'Z'));
                const transform = [];
                if (dist) {
                    transform.push(offset === 'X' ? `translate(${this.fixed(-dist)} 0)` : `translate(0 ${this.fixed(dist)})`);
                }
                if (a) {
                    const A = this.jax.fixed(-a * 180 / Math.PI);
                    transform.push(`rotate(${A} ${this.fixed(w / 2)} ${this.fixed(m)})`);
                }
                if (transform.length) {
                    this.adaptor.setAttribute(arrow, 'transform', transform.join(' '));
                }
                return arrow;
            }
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents);
                const left = this.getBBoxExtenders()[3];
                const def = {};
                if (left > 0) {
                    def.transform = 'translate(' + this.fixed(left) + ', 0)';
                }
                const block = this.adaptor.append(svg[0], this.svg('g', def));
                if (this.renderChild) {
                    this.renderChild(this, block);
                }
                else {
                    this.childNodes[0].toSVG([block]);
                    this.childNodes[0].place(0, 0);
                }
                for (const name of Object.keys(this.notations)) {
                    const notation = this.notations[name];
                    if (!notation.renderChild) {
                        notation.renderer(this, svg[0]);
                    }
                }
            }
        },
        _a.kind = MmlMenclose.prototype.kind,
        _a.notations = new Map([
            Notation.Border('top'),
            Notation.Border('right'),
            Notation.Border('bottom'),
            Notation.Border('left'),
            Notation.Border2('actuarial', 'top', 'right'),
            Notation.Border2('madruwb', 'bottom', 'right'),
            Notation.DiagonalStrike('up'),
            Notation.DiagonalStrike('down'),
            [
                'horizontalstrike',
                {
                    renderer: Notation.RenderLine('horizontal', 'Y'),
                    bbox: (node) => [0, node.padding, 0, node.padding],
                },
            ],
            [
                'verticalstrike',
                {
                    renderer: Notation.RenderLine('vertical', 'X'),
                    bbox: (node) => [node.padding, 0, node.padding, 0],
                },
            ],
            [
                'box',
                {
                    renderer: (node, _child) => {
                        const { w, h, d } = node.getBBox();
                        node.adaptor.append(node.dom[0], node.box(w, h, d));
                    },
                    bbox: Notation.fullBBox,
                    border: Notation.fullBorder,
                    remove: 'left right top bottom',
                },
            ],
            [
                'roundedbox',
                {
                    renderer: (node, _child) => {
                        const { w, h, d } = node.getBBox();
                        const r = node.thickness + node.padding;
                        node.adaptor.append(node.dom[0], node.box(w, h, d, r));
                    },
                    bbox: Notation.fullBBox,
                },
            ],
            [
                'circle',
                {
                    renderer: (node, _child) => {
                        const { w, h, d } = node.getBBox();
                        node.adaptor.append(node.dom[0], node.ellipse(w, h, d));
                    },
                    bbox: Notation.fullBBox,
                },
            ],
            [
                'phasorangle',
                {
                    renderer: (node, _child) => {
                        const { w, h, d } = node.getBBox();
                        const a = node.getArgMod(1.75 * node.padding, h + d)[0];
                        const t = node.thickness / 2;
                        const HD = h + d;
                        const cos = Math.cos(a);
                        node.adaptor.append(node.dom[0], node.path('mitre', 'M', w, t - d, 'L', t + cos * t, t - d, 'L', cos * HD + t, HD - d - t));
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
                    renderer: (node, _child) => {
                        const { w, h, d } = node.getBBox();
                        const t = node.thickness / 2;
                        const p = node.padding;
                        node.adaptor.append(node.dom[0], node.path('round', 'M', t, t - d, 'a', p - t / 2, (h + d) / 2 - 4 * t, 0, '0,1', 0, h + d - 2 * t, 'L', w - t, h - t));
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
                        node.msqrt.toSVG([child]);
                        const left = node.sqrtTRBL()[3];
                        node.place(-left, 0, child);
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