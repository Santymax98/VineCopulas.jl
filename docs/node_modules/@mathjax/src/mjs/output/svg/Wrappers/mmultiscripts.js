import { CommonMmultiscriptsMixin, } from '../../common/Wrappers/mmultiscripts.js';
import { SvgMsubsup } from './msubsup.js';
import { MmlMmultiscripts } from '../../../core/MmlTree/MmlNodes/mmultiscripts.js';
import { split } from '../../../util/string.js';
export function AlignX(align) {
    return ({
        left: (_w, _W) => 0,
        center: (w, W) => (W - w) / 2,
        right: (w, W) => W - w,
    }[align] || ((_w, _W) => 0));
}
export const SvgMmultiscripts = (function () {
    var _a;
    const Base = CommonMmultiscriptsMixin(SvgMsubsup);
    return _a = class SvgMmultiscripts extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                const data = this.scriptData;
                const scriptalign = this.node.getProperty('scriptalign') || 'right left';
                const [preAlign, postAlign] = split(scriptalign + ' ' + scriptalign);
                const [u, v] = this.getCombinedUV();
                let x = 0;
                if (data.numPrescripts) {
                    x = this.addScripts(this.dom[0], this.font.params.scriptspace, u, v, this.firstPrescript, data.numPrescripts, preAlign);
                }
                const base = this.baseChild;
                base.toSVG(svg);
                base.place(x, 0);
                if (this.breakCount)
                    x = 0;
                x += base.getLineBBox(base.breakCount).w;
                if (data.numScripts) {
                    this.addScripts(this.dom[this.dom.length - 1], x, u, v, 1, data.numScripts, postAlign);
                }
            }
            addScripts(svg, x, u, v, i, n, align) {
                const adaptor = this.adaptor;
                const alignX = AlignX(align);
                const supRow = adaptor.append(svg, this.svg('g'));
                const subRow = adaptor.append(svg, this.svg('g'));
                this.place(x, u, supRow);
                this.place(x, v, subRow);
                const m = i + 2 * n;
                let dx = 0;
                while (i < m) {
                    const [sub, sup] = [this.childNodes[i++], this.childNodes[i++]];
                    const [subbox, supbox] = [sub.getOuterBBox(), sup.getOuterBBox()];
                    const [subr, supr] = [subbox.rscale, supbox.rscale];
                    const w = Math.max(subbox.w * subr, supbox.w * supr);
                    sub.toSVG([subRow]);
                    sup.toSVG([supRow]);
                    sub.place(dx + alignX(subbox.w * subr, w), 0);
                    sup.place(dx + alignX(supbox.w * supr, w), 0);
                    dx += w;
                }
                return x + dx;
            }
        },
        _a.kind = MmlMmultiscripts.prototype.kind,
        _a;
})();
//# sourceMappingURL=mmultiscripts.js.map