import { BBox } from '../../../util/BBox.js';
import { DIRECTION } from '../FontData.js';
export function CommonMsqrtMixin(Base) {
    return class CommonMsqrtMixin extends Base {
        get base() {
            return 0;
        }
        get root() {
            return null;
        }
        combineRootBBox(_bbox, _sbox, _H) { }
        getPQ(sbox) {
            const t = this.font.params.rule_thickness;
            const s = this.font.params.surd_height;
            const p = this.node.attributes.get('displaystyle')
                ? this.font.params.x_height
                : t;
            const q = sbox.h + sbox.d > this.surdH
                ? (sbox.h + sbox.d - (this.surdH - t - s - p / 2)) / 2
                : s + p / 4;
            return [p, q];
        }
        getRootDimens(_sbox, _H) {
            return [0, 0, 0, 0];
        }
        rootWidth() {
            return 1.25;
        }
        getStretchedSurd() {
            const t = this.font.params.rule_thickness;
            const s = this.font.params.surd_height;
            const p = this.node.attributes.get('displaystyle')
                ? this.font.params.x_height
                : t;
            const { h, d } = this.childNodes[this.base].getOuterBBox();
            this.surdH = h + d + t + s + p / 4;
            this.surd.getStretchedVariant([this.surdH - d, d], true);
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.surd = this.createMo('\u221A');
            this.surd.canStretch(DIRECTION.Vertical);
            this.getStretchedSurd();
        }
        computeBBox(bbox, recompute = false) {
            bbox.empty();
            const surdbox = this.surd.getBBox();
            const basebox = new BBox(this.childNodes[this.base].getOuterBBox());
            const q = this.getPQ(surdbox)[1];
            const t = this.font.params.rule_thickness;
            const s = this.font.params.surd_height;
            const H = basebox.h + q + t;
            const [x] = this.getRootDimens(surdbox, H);
            bbox.h = H + s;
            this.combineRootBBox(bbox, surdbox, H);
            bbox.combine(surdbox, x, H - surdbox.h);
            bbox.combine(basebox, x + surdbox.w, 0);
            bbox.clean();
            this.setChildPWidths(recompute);
        }
        invalidateBBox() {
            super.invalidateBBox();
            this.surd.childNodes[0].invalidateBBox();
        }
    };
}
//# sourceMappingURL=msqrt.js.map