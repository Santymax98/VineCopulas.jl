export function CommonMsubMixin(Base) {
    var _a;
    return _a = class CommonMsubMixin extends Base {
            get scriptChild() {
                return this.childNodes[this.node.sub];
            }
            getOffset() {
                const x = this.baseIsChar ? 0 : this.getAdjustedIc();
                return [x, -this.getV()];
            }
        },
        _a.useIC = false,
        _a;
}
export function CommonMsupMixin(Base) {
    return class CommonMsupMixin extends Base {
        get scriptChild() {
            return this.childNodes[this.node.sup];
        }
        getOffset() {
            const x = this.getAdjustedIc() - (this.baseRemoveIc ? 0 : this.baseIc);
            return [x, this.getU()];
        }
    };
}
export function CommonMsubsupMixin(Base) {
    var _a;
    return _a = class CommonMsubsupMixin extends Base {
            constructor() {
                super(...arguments);
                this.UVQ = null;
            }
            get subChild() {
                return this.childNodes[this.node.sub];
            }
            get supChild() {
                return this.childNodes[this.node.sup];
            }
            get scriptChild() {
                return this.supChild;
            }
            getUVQ(subbox = this.subChild.getOuterBBox(), supbox = this.supChild.getOuterBBox()) {
                const base = this.baseCore;
                const bbox = base.getLineBBox(base.breakCount);
                if (this.UVQ)
                    return this.UVQ;
                const tex = this.font.params;
                const t = 3 * tex.rule_thickness;
                const subscriptshift = this.length2em(this.node.attributes.get('subscriptshift'), tex.sub2);
                const drop = this.baseCharZero(bbox.d * this.baseScale + tex.sub_drop * subbox.rscale);
                const supd = supbox.d * supbox.rscale;
                const subh = subbox.h * subbox.rscale;
                let [u, v] = [this.getU(), Math.max(drop, subscriptshift)];
                let q = u - supd - (subh - v);
                if (q < t) {
                    v += t - q;
                    const p = (4 / 5) * tex.x_height - (u - supd);
                    if (p > 0) {
                        u += p;
                        v -= p;
                    }
                }
                u = Math.max(this.length2em(this.node.attributes.get('superscriptshift'), u), u);
                v = Math.max(this.length2em(this.node.attributes.get('subscriptshift'), v), v);
                q = u - supd - (subh - v);
                this.UVQ = [u, -v, q];
                return this.UVQ;
            }
            appendScripts(bbox) {
                const [subbox, supbox] = [
                    this.subChild.getOuterBBox(),
                    this.supChild.getOuterBBox(),
                ];
                const w = this.getBaseWidth();
                const x = this.getAdjustedIc();
                const [u, v] = this.getUVQ();
                const y = bbox.d - this.baseChild.getLineBBox(this.baseChild.breakCount).d;
                bbox.combine(subbox, w + (this.baseIsChar ? 0 : x), v - y);
                bbox.combine(supbox, w + x, u - y);
                bbox.w += this.font.params.scriptspace;
                return bbox;
            }
        },
        _a.useIC = false,
        _a;
}
//# sourceMappingURL=msubsup.js.map