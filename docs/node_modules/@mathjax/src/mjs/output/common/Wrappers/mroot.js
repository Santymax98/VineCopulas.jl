export function CommonMrootMixin(Base) {
    return class CommonMrootMixin extends Base {
        get root() {
            return 1;
        }
        combineRootBBox(BBOX, sbox, H) {
            const bbox = this.childNodes[this.root].getOuterBBox();
            const h = this.getRootDimens(sbox, H)[1];
            BBOX.combine(bbox, 0, h);
        }
        getRootDimens(sbox, H) {
            const surd = this.surd;
            const bbox = this.childNodes[this.root].getOuterBBox();
            const offset = (surd.size < 0 ? 0.5 : 0.6) * sbox.w;
            const { w, rscale } = bbox;
            const W = Math.max(w, offset / rscale);
            const dx = Math.max(0, W - w);
            const h = this.rootHeight(bbox, sbox, surd.size, H);
            const x = W * rscale - offset;
            return [x, h, dx];
        }
        rootHeight(rbox, sbox, size, H) {
            const h = sbox.h + sbox.d;
            const b = (size < 0 ? 1.9 : 0.55 * h) - (h - H);
            return b + Math.max(0, rbox.d * rbox.rscale);
        }
        rootWidth() {
            const bbox = this.childNodes[this.root].getOuterBBox();
            return 0.4 + bbox.w * bbox.rscale;
        }
    };
}
//# sourceMappingURL=mroot.js.map