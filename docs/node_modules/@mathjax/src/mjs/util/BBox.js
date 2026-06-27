import { BIGDIMEN } from './lengths.js';
export class BBox {
    static zero() {
        return new BBox({ h: 0, d: 0, w: 0 });
    }
    static empty() {
        return new BBox();
    }
    constructor(def = { w: 0, h: -BIGDIMEN, d: -BIGDIMEN }) {
        this.w = def.w || 0;
        this.h = 'h' in def ? def.h : -BIGDIMEN;
        this.d = 'd' in def ? def.d : -BIGDIMEN;
        this.L = this.R = this.ic = this.oc = this.sk = this.dx = 0;
        this.scale = this.rscale = 1;
        this.pwidth = '';
    }
    empty() {
        this.w = 0;
        this.h = this.d = -BIGDIMEN;
        return this;
    }
    clean() {
        if (this.w === -BIGDIMEN)
            this.w = 0;
        if (this.h === -BIGDIMEN)
            this.h = 0;
        if (this.d === -BIGDIMEN)
            this.d = 0;
    }
    rescale(scale) {
        this.w *= scale;
        this.h *= scale;
        this.d *= scale;
    }
    combine(cbox, x = 0, y = 0) {
        const rscale = cbox.rscale;
        const w = x + rscale * (cbox.w + cbox.L + cbox.R);
        const h = y + rscale * cbox.h;
        const d = rscale * cbox.d - y;
        if (w > this.w)
            this.w = w;
        if (h > this.h)
            this.h = h;
        if (d > this.d)
            this.d = d;
    }
    append(cbox) {
        const scale = cbox.rscale;
        this.w += scale * (cbox.w + cbox.L + cbox.R);
        if (scale * cbox.h > this.h) {
            this.h = scale * cbox.h;
        }
        if (scale * cbox.d > this.d) {
            this.d = scale * cbox.d;
        }
    }
    updateFrom(cbox) {
        this.h = cbox.h;
        this.d = cbox.d;
        this.w = cbox.w;
        if (cbox.pwidth) {
            this.pwidth = cbox.pwidth;
        }
    }
    copy() {
        const bbox = new BBox();
        Object.assign(bbox, this);
        return bbox;
    }
}
BBox.fullWidth = '100%';
BBox.boxSides = [
    ['Top', 0, 'h'],
    ['Right', 1, 'w'],
    ['Bottom', 2, 'd'],
    ['Left', 3, 'w'],
];
//# sourceMappingURL=BBox.js.map