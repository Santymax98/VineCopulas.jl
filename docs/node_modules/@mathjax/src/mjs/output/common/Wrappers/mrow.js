import { BBox } from '../../../util/BBox.js';
import { LineBBox } from '../LineBBox.js';
import { DIRECTION } from '../FontData.js';
export function CommonMrowMixin(Base) {
    return class CommonMrowMixin extends Base {
        stretchChildren() {
            const stretchy = [];
            for (const child of this.childNodes) {
                if (child.canStretch(DIRECTION.Vertical)) {
                    stretchy.push(child);
                }
            }
            const count = stretchy.length;
            const nodeCount = this.childNodes.length;
            if (count && nodeCount > 1) {
                let H = 0;
                let D = 0;
                const all = count > 1 && count === nodeCount;
                for (const child of this.childNodes) {
                    const noStretch = child.stretch.dir === DIRECTION.None;
                    if (all || noStretch) {
                        const rscale = child.getBBox().rscale;
                        let [h, d] = child.getUnbrokenHD();
                        h *= rscale;
                        d *= rscale;
                        if (h > H)
                            H = h;
                        if (d > D)
                            D = d;
                    }
                }
                for (const child of stretchy) {
                    const rscale = child.coreRScale();
                    child.coreMO().getStretchedVariant([H / rscale, D / rscale]);
                }
            }
        }
        get fixesPWidth() {
            return false;
        }
        get breakCount() {
            if (this._breakCount < 0) {
                this._breakCount = !this.childNodes.length
                    ? 0
                    : this.childNodes.reduce((n, child) => n + child.breakCount, 0);
            }
            return this._breakCount;
        }
        breakTop(_mrow, _child) {
            const node = this;
            return this.isStack ? this.parent.breakTop(node, node) : node;
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.dh = 0;
            const self = this;
            this.isStack =
                !this.parent ||
                    this.parent.node.isInferred ||
                    this.parent.breakTop(self, self) !== self;
            this.stretchChildren();
            for (const child of this.childNodes) {
                if (child.bbox.pwidth) {
                    this.bbox.pwidth = BBox.fullWidth;
                    break;
                }
            }
        }
        computeBBox(bbox, recompute = false) {
            const breaks = this.breakCount;
            this.lineBBox = breaks
                ? [new LineBBox({ h: 0.75, d: 0.25, w: 0 }, [0, 0])]
                : [];
            bbox.empty();
            for (const i of this.childNodes.keys()) {
                const child = this.childNodes[i];
                bbox.append(child.getOuterBBox());
                if (breaks) {
                    this.computeChildLineBBox(child, i);
                }
            }
            bbox.clean();
            if (breaks && !this.coreMO().node.isEmbellished) {
                this.computeLinebreakBBox(bbox);
            }
            if (this.fixesPWidth && this.setChildPWidths(recompute)) {
                this.computeBBox(bbox, true);
            }
            this.vboxAdjust(bbox);
        }
        computeLinebreakBBox(bbox) {
            var _a;
            bbox.empty();
            const isStack = this.isStack;
            const lines = this.lineBBox;
            const n = lines.length - 1;
            if (isStack) {
                for (const k of lines.keys()) {
                    const line = lines[k];
                    this.addMiddleBorders(line);
                    if (k === 0) {
                        this.addLeftBorders(line);
                    }
                    if (k === n) {
                        this.addRightBorders(line);
                    }
                }
            }
            let y = 0;
            for (const k of lines.keys()) {
                const line = lines[k];
                bbox.combine(line, 0, y);
                y -=
                    Math.max(0.25, line.d) +
                        line.lineLeading +
                        Math.max(0.75, ((_a = lines[k + 1]) === null || _a === void 0 ? void 0 : _a.h) || 0);
            }
            if (isStack) {
                lines[0].L = this.bbox.L;
                lines[n].R = this.bbox.R;
            }
            else {
                bbox.w = Math.max(...this.lineBBox.map((bbox) => bbox.w));
                this.shiftLines(bbox);
                if (!this.jax.math.display && !this.linebreakOptions.inline) {
                    bbox.pwidth = BBox.fullWidth;
                    if (this.node.isInferred) {
                        this.parent.bbox.pwidth = BBox.fullWidth;
                    }
                }
            }
            bbox.clean();
        }
        vboxAdjust(bbox) {
            if (!this.parent)
                return;
            const n = this.breakCount;
            const valign = this.parent.node.attributes.get('data-vertical-align');
            if (n && valign === 'bottom') {
                this.dh = n ? bbox.d - this.lineBBox[n - 1].d : 0;
            }
            else if (valign === 'center' || (n && valign === 'middle')) {
                const { h, d } = bbox;
                const a = this.font.params.axis_height;
                this.dh = (h + d) / 2 + a - h;
            }
            else {
                this.dh = 0;
                return;
            }
            bbox.h += this.dh;
            bbox.d -= this.dh;
        }
        computeChildLineBBox(child, i) {
            const lbox = this.lineBBox[this.lineBBox.length - 1];
            lbox.end = [i, 0];
            lbox.append(child.getLineBBox(0));
            const parts = child.breakCount + 1;
            if (parts === 1)
                return;
            for (let l = 1; l < parts; l++) {
                const bbox = new LineBBox({ h: 0.75, d: 0.25, w: 0 });
                bbox.start = bbox.end = [i, l];
                bbox.isFirst = true;
                bbox.append(child.getLineBBox(l));
                this.lineBBox.push(bbox);
            }
        }
        getLineBBox(i) {
            this.getBBox();
            return this.isStack
                ? super.getLineBBox(i)
                : LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
        }
        shiftLines(BBOX) {
            var _a, _b;
            const W = BBOX.w;
            const lines = this.lineBBox;
            const n = lines.length - 1;
            const [alignfirst, shiftfirst] = ((_a = lines[1].indentData) === null || _a === void 0 ? void 0 : _a[0]) || [
                'left',
                '0',
            ];
            for (const i of lines.keys()) {
                const bbox = lines[i];
                const [indentalign, indentshift] = i === 0
                    ? [alignfirst, shiftfirst]
                    : ((_b = bbox.indentData) === null || _b === void 0 ? void 0 : _b[i === n ? 2 : 1]) || ['left', '0'];
                const [align, shift] = this.processIndent(indentalign, indentshift, alignfirst, shiftfirst, W);
                bbox.L = 0;
                bbox.L = this.getAlignX(W, bbox, align) + shift;
                const w = bbox.L + bbox.w;
                if (w > BBOX.w) {
                    BBOX.w = w;
                }
            }
        }
        setChildPWidths(recompute, w = null, clear = true) {
            if (!this.breakCount)
                return super.setChildPWidths(recompute, w, clear);
            if (recompute)
                return false;
            if (w !== null && this.bbox.w !== w) {
                this.bbox.w = w;
                this.shiftLines(this.bbox);
            }
            return true;
        }
        breakToWidth(W) {
            this.linebreaks.breakToWidth(this, W);
        }
    };
}
export function CommonInferredMrowMixin(Base) {
    return class CommonInferredMrowMixin extends Base {
        getScale() {
            this.bbox.scale = this.parent.bbox.scale;
            this.bbox.rscale = 1;
        }
    };
}
//# sourceMappingURL=mrow.js.map