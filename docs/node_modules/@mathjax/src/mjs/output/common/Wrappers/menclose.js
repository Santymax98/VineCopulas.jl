import * as Notation from '../Notation.js';
import { split } from '../../../util/string.js';
export function CommonMencloseMixin(Base) {
    return class CommonMencloseMixin extends Base {
        getParameters() {
            const attributes = this.node.attributes;
            const padding = attributes.get('data-padding');
            if (padding !== undefined) {
                this.padding = this.length2em(padding, Notation.PADDING);
            }
            const thickness = attributes.get('data-thickness');
            if (thickness !== undefined) {
                this.thickness = this.length2em(thickness, Notation.THICKNESS);
            }
            const arrowhead = attributes.get('data-arrowhead');
            if (arrowhead !== undefined) {
                const [x, y, dx] = split(arrowhead);
                this.arrowhead = {
                    x: x ? parseFloat(x) : Notation.ARROWX,
                    y: y ? parseFloat(y) : Notation.ARROWY,
                    dx: dx ? parseFloat(dx) : Notation.ARROWDX,
                };
            }
        }
        getNotations() {
            const Notations = this.constructor.notations;
            for (const name of split(this.node.attributes.get('notation'))) {
                const notation = Notations.get(name);
                if (notation) {
                    this.notations[name] = notation;
                    if (notation.renderChild) {
                        this.renderChild = notation.renderer;
                    }
                }
            }
        }
        removeRedundantNotations() {
            for (const name of Object.keys(this.notations)) {
                if (this.notations[name]) {
                    const remove = this.notations[name].remove || '';
                    for (const notation of remove.split(/ /)) {
                        delete this.notations[notation];
                    }
                }
            }
        }
        initializeNotations() {
            for (const name of Object.keys(this.notations)) {
                const init = this.notations[name].init;
                if (init) {
                    init(this);
                }
            }
        }
        getBBoxExtenders() {
            const TRBL = [0, 0, 0, 0];
            for (const name of Object.keys(this.notations)) {
                this.maximizeEntries(TRBL, this.notations[name].bbox(this));
            }
            return TRBL;
        }
        getPadding() {
            const BTRBL = [0, 0, 0, 0];
            for (const name of Object.keys(this.notations)) {
                const border = this.notations[name].border;
                if (border) {
                    this.maximizeEntries(BTRBL, border(this));
                }
            }
            return [0, 1, 2, 3].map((i) => this.TRBL[i] - BTRBL[i]);
        }
        maximizeEntries(X, Y) {
            for (let i = 0; i < X.length; i++) {
                if (X[i] < Y[i]) {
                    X[i] = Y[i];
                }
            }
        }
        getOffset(direction) {
            const [T, R, B, L] = this.TRBL;
            const d = (direction === 'X' ? R - L : B - T) / 2;
            return Math.abs(d) > 0.001 ? d : 0;
        }
        getArgMod(w, h) {
            return [Math.atan2(h, w), Math.sqrt(w * w + h * h)];
        }
        arrow(_w, _a, _double, _offset = '', _dist = 0) {
            return null;
        }
        arrowData() {
            const [p, t] = [this.padding, this.thickness];
            const r = t * (this.arrowhead.x + Math.max(1, this.arrowhead.dx));
            const { h, d, w } = this.childNodes[0].getBBox();
            const H = h + d;
            const R = Math.sqrt(H * H + w * w);
            const x = Math.max(p, (r * w) / R);
            const y = Math.max(p, (r * H) / R);
            const [a, W] = this.getArgMod(w + 2 * x, H + 2 * y);
            return { a, W, x, y };
        }
        arrowAW() {
            const { h, d, w } = this.childNodes[0].getBBox();
            const [T, R, B, L] = this.TRBL;
            return this.getArgMod(L + w + R, T + h + d + B);
        }
        createMsqrt(child) {
            const mmlFactory = this.node.factory;
            const mml = mmlFactory.create('msqrt');
            mml.inheritAttributesFrom(this.node);
            mml.childNodes[0] = child.node;
            const node = this.wrap(mml);
            node.parent = this;
            return node;
        }
        sqrtTRBL() {
            const bbox = this.msqrt.getBBox();
            const cbox = this.msqrt.childNodes[0].getBBox();
            return [bbox.h - cbox.h, 0, bbox.d - cbox.d, bbox.w - cbox.w];
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.notations = {};
            this.renderChild = null;
            this.msqrt = null;
            this.padding = Notation.PADDING;
            this.thickness = Notation.THICKNESS;
            this.arrowhead = {
                x: Notation.ARROWX,
                y: Notation.ARROWY,
                dx: Notation.ARROWDX,
            };
            this.TRBL = [0, 0, 0, 0];
            this.getParameters();
            this.getNotations();
            this.removeRedundantNotations();
            this.initializeNotations();
            this.TRBL = this.getBBoxExtenders();
        }
        computeBBox(bbox, recompute = false) {
            const [T, R, B, L] = this.TRBL;
            const child = this.childNodes[0].getBBox();
            bbox.combine(child, L, 0);
            bbox.h += T;
            bbox.d += B;
            bbox.w += R;
            this.setChildPWidths(recompute);
        }
    };
}
//# sourceMappingURL=menclose.js.map