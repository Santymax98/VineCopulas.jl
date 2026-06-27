import { DIRECTION } from '../FontData.js';
export function CommonMfracMixin(Base) {
    return class CommonMfracMixin extends Base {
        getFractionBBox(bbox, display, t) {
            const nbox = this.childNodes[0].getOuterBBox();
            const dbox = this.childNodes[1].getOuterBBox();
            const tex = this.font.params;
            const a = tex.axis_height;
            const { T, u, v } = this.getTUV(display, t);
            bbox.combine(nbox, 0, a + T + Math.max(nbox.d * nbox.rscale, u));
            bbox.combine(dbox, 0, a - T - Math.max(dbox.h * dbox.rscale, v));
            bbox.w += 2 * this.pad + 0.2;
        }
        getTUV(display, t) {
            const tex = this.font.params;
            const a = tex.axis_height;
            const T = (display ? 3.5 : 1.5) * t;
            return {
                T: (display ? 3.5 : 1.5) * t,
                u: (display ? tex.num1 : tex.num2) - a - T,
                v: (display ? tex.denom1 : tex.denom2) + a - T,
            };
        }
        getAtopBBox(bbox, display) {
            const { u, v, nbox, dbox } = this.getUVQ(display);
            bbox.combine(nbox, 0, u);
            bbox.combine(dbox, 0, -v);
            bbox.w += 2 * this.pad;
        }
        getUVQ(display) {
            const nbox = this.childNodes[0].getOuterBBox();
            const dbox = this.childNodes[1].getOuterBBox();
            const tex = this.font.params;
            let [u, v] = display ? [tex.num1, tex.denom1] : [tex.num3, tex.denom2];
            const p = (display ? 7 : 3) * tex.rule_thickness;
            let q = u - nbox.d * nbox.scale - (dbox.h * dbox.scale - v);
            if (q < p) {
                u += (p - q) / 2;
                v += (p - q) / 2;
                q = p;
            }
            return { u, v, q, nbox, dbox };
        }
        getBevelledBBox(bbox, display) {
            const { u, v, delta, nbox, dbox } = this.getBevelData(display);
            const lbox = this.bevel.getOuterBBox();
            bbox.combine(nbox, 0, u);
            bbox.combine(lbox, bbox.w - delta / 2, 0);
            bbox.combine(dbox, bbox.w - delta / 2, v);
        }
        getBevelData(display) {
            const nbox = this.childNodes[0].getOuterBBox();
            const dbox = this.childNodes[1].getOuterBBox();
            const delta = display ? 0.4 : 0.15;
            const H = Math.max(nbox.scale * (nbox.h + nbox.d), dbox.scale * (dbox.h + dbox.d)) +
                2 * delta;
            const a = this.font.params.axis_height;
            const u = (nbox.scale * (nbox.d - nbox.h)) / 2 + a + delta;
            const v = (dbox.scale * (dbox.d - dbox.h)) / 2 + a - delta;
            return { H, delta, u, v, nbox, dbox };
        }
        isDisplay() {
            const { displaystyle, scriptlevel } = this.node.attributes.getList('displaystyle', 'scriptlevel');
            return displaystyle && scriptlevel === 0;
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.bevel = null;
            this.pad = this.node.getProperty('withDelims')
                ? 0
                : this.font.params.nulldelimiterspace;
            if (this.node.attributes.get('bevelled')) {
                const { H } = this.getBevelData(this.isDisplay());
                const bevel = (this.bevel = this.createMo('/'));
                bevel.node.attributes.set('symmetric', true);
                bevel.canStretch(DIRECTION.Vertical);
                bevel.getStretchedVariant([H], true);
            }
        }
        computeBBox(bbox, recompute = false) {
            bbox.empty();
            const { linethickness, bevelled } = this.node.attributes.getList('linethickness', 'bevelled');
            const display = this.isDisplay();
            let w = null;
            if (bevelled) {
                this.getBevelledBBox(bbox, display);
            }
            else {
                const thickness = this.length2em(String(linethickness), 0.06);
                w = -2 * this.pad;
                if (thickness === 0) {
                    this.getAtopBBox(bbox, display);
                }
                else {
                    this.getFractionBBox(bbox, display, thickness);
                    w -= 0.2;
                }
                w += bbox.w;
            }
            bbox.clean();
            this.setChildPWidths(recompute, w);
        }
        canStretch(_direction) {
            return false;
        }
        getChildAlign(i) {
            const attributes = this.node.attributes;
            return attributes.get('bevelled')
                ? 'left'
                : attributes.get(['numalign', 'denomalign'][i]);
        }
        getWrapWidth(i) {
            const attributes = this.node.attributes;
            if (attributes.get('bevelled')) {
                return this.childNodes[i].getOuterBBox().w;
            }
            const w = this.getBBox().w;
            const thickness = this.length2em(attributes.get('linethickness'));
            return w - (thickness ? 0.2 : 0) - 2 * this.pad;
        }
    };
}
//# sourceMappingURL=mfrac.js.map