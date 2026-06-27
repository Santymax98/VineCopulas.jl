import { LineBBox } from '../LineBBox.js';
import { DIRECTION } from '../FontData.js';
export function CommonScriptbaseMixin(Base) {
    var _a;
    return _a = class CommonScriptbaseMixin extends Base {
            get baseChild() {
                return this.childNodes[this.node.base];
            }
            get scriptChild() {
                return this.childNodes[1];
            }
            getBaseCore() {
                let core = this.getSemanticBase() || this.childNodes[0];
                let node = core === null || core === void 0 ? void 0 : core.node;
                while (core &&
                    ((core.childNodes.length === 1 &&
                        (node.isKind('mrow') ||
                            node.isKind('TeXAtom') ||
                            node.isKind('mstyle') ||
                            (node.isKind('mpadded') && !node.getProperty('vbox')) ||
                            node.isKind('mphantom') ||
                            node.isKind('semantics'))) ||
                        (node.isKind('munderover') &&
                            core.isMathAccent))) {
                    this.setBaseAccentsFor(core);
                    core = core.childNodes[0];
                    node = core === null || core === void 0 ? void 0 : core.node;
                }
                if (!core) {
                    this.baseHasAccentOver = this.baseHasAccentUnder = false;
                }
                return core || this.childNodes[0];
            }
            setBaseAccentsFor(core) {
                if (core.node.isKind('munderover')) {
                    if (this.baseHasAccentOver === null) {
                        this.baseHasAccentOver = !!core.node.attributes.get('accent');
                    }
                    if (this.baseHasAccentUnder === null) {
                        this.baseHasAccentUnder = !!core.node.attributes.get('accentunder');
                    }
                }
            }
            getSemanticBase() {
                const fence = this.node.attributes.getExplicit('data-semantic-fencepointer');
                return this.getBaseFence(this.baseChild, fence);
            }
            getBaseFence(fence, id) {
                if (!fence || !fence.node.attributes || !id) {
                    return null;
                }
                if (fence.node.attributes.getExplicit('data-semantic-id') === id) {
                    return fence;
                }
                for (const child of fence.childNodes) {
                    const result = this.getBaseFence(child, id);
                    if (result) {
                        return result;
                    }
                }
                return null;
            }
            getBaseScale() {
                let child = this.baseCore;
                let scale = 1;
                while (child && child !== this) {
                    const bbox = child.getOuterBBox();
                    scale *= bbox.rscale;
                    child = child.parent;
                }
                return scale;
            }
            getBaseIc() {
                return this.baseCore.getOuterBBox().ic * this.baseScale;
            }
            getAdjustedIc() {
                return this.baseIc ? 1.05 * this.baseIc + 0.05 : 0;
            }
            isCharBase() {
                const base = this.baseCore;
                return (((base.node.isKind('mo') && base.size === null) ||
                    base.node.isKind('mi') ||
                    base.node.isKind('mn')) &&
                    base.bbox.rscale === 1 &&
                    Array.from(base.getText()).length === 1);
            }
            checkLineAccents() {
                if (!this.node.isKind('munderover'))
                    return;
                if (this.node.isKind('mover')) {
                    this.isLineAbove = this.isLineAccent(this.scriptChild);
                }
                else if (this.node.isKind('munder')) {
                    this.isLineBelow = this.isLineAccent(this.scriptChild);
                }
                else {
                    const mml = this;
                    this.isLineAbove = this.isLineAccent(mml.overChild);
                    this.isLineBelow = this.isLineAccent(mml.underChild);
                }
            }
            isLineAccent(script) {
                const node = script.coreMO().node;
                return node.isToken && node.getText() === '\u2015';
            }
            getBaseWidth() {
                const bbox = this.baseChild.getLineBBox(this.baseChild.breakCount);
                return (bbox.w * bbox.rscale -
                    (this.baseRemoveIc ? this.baseIc : 0) +
                    this.font.params.extra_ic);
            }
            getOffset() {
                return [0, 0];
            }
            baseCharZero(n) {
                const largeop = !!this.baseCore.node.attributes.get('largeop');
                const sized = !!(this.baseCore.node.isKind('mo') &&
                    this.baseCore.size);
                const scale = this.baseScale;
                return this.baseIsChar && !largeop && !sized && scale === 1 ? 0 : n;
            }
            getV() {
                const base = this.baseCore;
                const bbox = base.getLineBBox(base.breakCount);
                const sbox = this.scriptChild.getOuterBBox();
                const tex = this.font.params;
                const subscriptshift = this.length2em(this.node.attributes.get('subscriptshift'), tex.sub1);
                return Math.max(this.baseCharZero(bbox.d * this.baseScale + tex.sub_drop * sbox.rscale), subscriptshift, sbox.h * sbox.rscale - (4 / 5) * tex.x_height);
            }
            getU() {
                const base = this.baseCore;
                const bbox = base.getLineBBox(base.breakCount);
                const sbox = this.scriptChild.getOuterBBox();
                const tex = this.font.params;
                const attr = this.node.attributes.getList('displaystyle', 'superscriptshift');
                const prime = this.node.getProperty('texprimestyle');
                const p = prime ? tex.sup3 : attr.displaystyle ? tex.sup1 : tex.sup2;
                const superscriptshift = this.length2em(attr.superscriptshift, p);
                return Math.max(this.baseCharZero(bbox.h * this.baseScale - tex.sup_drop * sbox.rscale), superscriptshift, sbox.d * sbox.rscale + (1 / 4) * tex.x_height);
            }
            hasMovableLimits() {
                const display = this.node.attributes.get('displaystyle');
                const mo = this.baseChild.coreMO().node;
                return !display && !!mo.attributes.get('movablelimits');
            }
            getOverKU(basebox, overbox) {
                const accent = this.node.attributes.get('accent');
                const tex = this.font.params;
                const d = overbox.d * overbox.rscale;
                const t = tex.rule_thickness * tex.separation_factor;
                const delta = this.baseHasAccentOver ? t : 0;
                const T = this.isLineAbove ? 3 * tex.rule_thickness : t;
                const k = (accent
                    ? T
                    : Math.max(tex.big_op_spacing1, tex.big_op_spacing3 - Math.max(0, d))) - delta;
                return [k, basebox.h * basebox.rscale + k + d];
            }
            getUnderKV(basebox, underbox) {
                const accent = this.node.attributes.get('accentunder');
                const tex = this.font.params;
                const h = underbox.h * underbox.rscale;
                const t = tex.rule_thickness * tex.separation_factor;
                const delta = this.baseHasAccentUnder ? t : 0;
                const T = this.isLineBelow ? 3 * tex.rule_thickness : t;
                const k = (accent ? T : Math.max(tex.big_op_spacing2, tex.big_op_spacing4 - h)) -
                    delta;
                return [k, -(basebox.d * basebox.rscale + k + h)];
            }
            getDeltaW(boxes, delta = [0, 0, 0]) {
                const align = this.node.attributes.get('align');
                const widths = boxes.map((box) => box.w * box.rscale);
                widths[0] -=
                    this.baseRemoveIc && !this.baseCore.node.attributes.get('largeop')
                        ? this.baseIc
                        : 0;
                const w = Math.max(...widths);
                const dw = [];
                let m = 0;
                for (const i of widths.keys()) {
                    dw[i] =
                        (align === 'center'
                            ? (w - widths[i]) / 2
                            : align === 'right'
                                ? w - widths[i]
                                : 0) + delta[i];
                    if (dw[i] < m) {
                        m = -dw[i];
                    }
                }
                if (m) {
                    for (const i of dw.keys()) {
                        dw[i] += m;
                    }
                }
                [1, 2].map((i) => (dw[i] += boxes[i] ? boxes[i].dx * boxes[0].rscale : 0));
                return dw;
            }
            getDelta(script, noskew = false) {
                const accent = this.node.attributes.get('accent');
                let { sk, ic } = this.baseCore.getOuterBBox();
                if (accent) {
                    sk -= script.getOuterBBox().sk;
                }
                return (((accent && !noskew ? sk : 0) + this.font.skewIcFactor * ic) *
                    this.baseScale);
            }
            stretchChildren() {
                const stretchy = [];
                for (const child of this.childNodes) {
                    if (child.canStretch(DIRECTION.Horizontal)) {
                        stretchy.push(child);
                    }
                }
                const count = stretchy.length;
                const nodeCount = this.childNodes.length;
                if (count && nodeCount > 1) {
                    let W = 0;
                    const all = count > 1 && count === nodeCount;
                    for (const child of this.childNodes) {
                        const noStretch = child.stretch.dir === DIRECTION.None;
                        if (all || noStretch) {
                            const { w, rscale } = child.getOuterBBox(noStretch);
                            if (w * rscale > W)
                                W = w * rscale;
                        }
                    }
                    for (const child of stretchy) {
                        const core = child.coreMO();
                        if (core.size === null) {
                            core.getStretchedVariant([W / child.coreRScale()]);
                        }
                    }
                }
            }
            constructor(factory, node, parent = null) {
                super(factory, node, parent);
                this.baseScale = 1;
                this.baseIc = 0;
                this.baseRemoveIc = false;
                this.baseIsChar = false;
                this.baseHasAccentOver = null;
                this.baseHasAccentUnder = null;
                this.isLineAbove = false;
                this.isLineBelow = false;
                this.isMathAccent = false;
                const core = (this.baseCore = this.getBaseCore());
                if (!core)
                    return;
                this.setBaseAccentsFor(core);
                this.baseScale = this.getBaseScale();
                this.baseIc = this.getBaseIc();
                this.baseIsChar = this.isCharBase();
                this.isMathAccent =
                    this.baseIsChar &&
                        this.scriptChild &&
                        this.scriptChild.coreMO().node.getProperty('mathaccent') !== undefined;
                this.checkLineAccents();
                this.baseRemoveIc =
                    !this.isLineAbove &&
                        !this.isLineBelow &&
                        (!(this.constructor
                            .useIC) ||
                            this.isMathAccent);
            }
            computeBBox(bbox, recompute = false) {
                bbox.empty();
                bbox.append(this.baseChild.getOuterBBox());
                this.appendScripts(bbox);
                bbox.clean();
                this.setChildPWidths(recompute);
            }
            appendScripts(bbox) {
                const w = this.getBaseWidth();
                const [x, y] = this.getOffset();
                bbox.combine(this.scriptChild.getOuterBBox(), w + x, y);
                bbox.w += this.font.params.scriptspace;
                return bbox;
            }
            get breakCount() {
                if (this._breakCount < 0) {
                    this._breakCount = this.node.isEmbellished
                        ? this.coreMO().embellishedBreakCount
                        : !this.node.linebreakContainer
                            ? this.childNodes[0].breakCount
                            : 0;
                }
                return this._breakCount;
            }
            breakTop(mrow, child) {
                return this.node.linebreakContainer ||
                    !this.parent ||
                    this.node.childIndex(child.node)
                    ? mrow
                    : this.parent.breakTop(mrow, this);
            }
            computeLineBBox(i) {
                const n = this.breakCount;
                if (!n)
                    return LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
                const bbox = this.baseChild.getLineBBox(i).copy();
                if (i < n) {
                    if (i === 0) {
                        this.addLeftBorders(bbox);
                    }
                    this.addMiddleBorders(bbox);
                }
                else {
                    this.appendScripts(bbox);
                    this.addMiddleBorders(bbox);
                    this.addRightBorders(bbox);
                }
                return bbox;
            }
        },
        _a.useIC = true,
        _a;
}
//# sourceMappingURL=scriptbase.js.map