import { SvgWrapper } from '../Wrapper.js';
import { CommonMfracMixin, } from '../../common/Wrappers/mfrac.js';
import { MmlMfrac } from '../../../core/MmlTree/MmlNodes/mfrac.js';
export const SvgMfrac = (function () {
    var _a;
    const Base = CommonMfracMixin(SvgWrapper);
    return _a = class SvgMfrac extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                this.standardSvgNodes(parents);
                const { linethickness, bevelled } = this.node.attributes.getList('linethickness', 'bevelled');
                const display = this.isDisplay();
                if (bevelled) {
                    this.makeBevelled(display);
                }
                else {
                    const thickness = this.length2em(String(linethickness), 0.06);
                    if (thickness === 0) {
                        this.makeAtop(display);
                    }
                    else {
                        this.makeFraction(display, thickness);
                    }
                }
            }
            makeFraction(display, t) {
                const svg = this.dom;
                const { numalign, denomalign } = this.node.attributes.getList('numalign', 'denomalign');
                const [num, den] = this.childNodes;
                const nbox = num.getOuterBBox();
                const dbox = den.getOuterBBox();
                const tex = this.font.params;
                const a = tex.axis_height;
                const d = 0.1;
                const pad = this.node.getProperty('withDelims')
                    ? 0
                    : tex.nulldelimiterspace;
                const W = Math.max((nbox.L + nbox.w + nbox.R) * nbox.rscale, (dbox.L + dbox.w + dbox.R) * dbox.rscale);
                const nx = this.getAlignX(W, nbox, numalign) + d + pad;
                const dx = this.getAlignX(W, dbox, denomalign) + d + pad;
                const { T, u, v } = this.getTUV(display, t);
                num.toSVG(svg);
                num.place(nx, a + T + Math.max(nbox.d * nbox.rscale, u));
                den.toSVG(svg);
                den.place(dx, a - T - Math.max(dbox.h * dbox.rscale, v));
                this.adaptor.append(svg[0], this.svg('rect', {
                    width: this.fixed(W + 2 * d),
                    height: this.fixed(t),
                    x: this.fixed(pad),
                    y: this.fixed(a - t / 2),
                }));
            }
            makeAtop(display) {
                const svg = this.dom;
                const { numalign, denomalign } = this.node.attributes.getList('numalign', 'denomalign');
                const [num, den] = this.childNodes;
                const nbox = num.getOuterBBox();
                const dbox = den.getOuterBBox();
                const tex = this.font.params;
                const pad = this.node.getProperty('withDelims')
                    ? 0
                    : tex.nulldelimiterspace;
                const W = Math.max((nbox.L + nbox.w + nbox.R) * nbox.rscale, (dbox.L + dbox.w + dbox.R) * dbox.rscale);
                const nx = this.getAlignX(W, nbox, numalign) + pad;
                const dx = this.getAlignX(W, dbox, denomalign) + pad;
                const { u, v } = this.getUVQ(display);
                num.toSVG(svg);
                num.place(nx, u);
                den.toSVG(svg);
                den.place(dx, -v);
            }
            makeBevelled(display) {
                const svg = this.dom;
                const [num, den] = this.childNodes;
                const { u, v, delta, nbox, dbox } = this.getBevelData(display);
                const w = (nbox.L + nbox.w + nbox.R) * nbox.rscale;
                num.toSVG(svg);
                this.bevel.toSVG(svg);
                den.toSVG(svg);
                num.place(nbox.L * nbox.rscale, u);
                this.bevel.place(w - delta / 2, 0);
                den.place(w + this.bevel.getOuterBBox().w + dbox.L * dbox.rscale - delta, v);
            }
        },
        _a.kind = MmlMfrac.prototype.kind,
        _a;
})();
//# sourceMappingURL=mfrac.js.map