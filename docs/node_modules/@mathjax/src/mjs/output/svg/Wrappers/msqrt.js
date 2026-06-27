import { SvgWrapper } from '../Wrapper.js';
import { CommonMsqrtMixin, } from '../../common/Wrappers/msqrt.js';
import { MmlMsqrt } from '../../../core/MmlTree/MmlNodes/msqrt.js';
export const SvgMsqrt = (function () {
    var _a;
    const Base = CommonMsqrtMixin(SvgWrapper);
    return _a = class SvgMsqrt extends Base {
            constructor() {
                super(...arguments);
                this.dx = 0;
            }
            addRoot(_ROOT, _root, _sbox, _H) {
                return 0;
            }
            toSVG(parents) {
                const surd = this.surd;
                const base = this.childNodes[this.base];
                const root = this.root ? this.childNodes[this.root] : null;
                const sbox = surd.getBBox();
                const bbox = base.getOuterBBox();
                const q = this.getPQ(sbox)[1];
                const t = this.font.params.surd_height * this.bbox.scale;
                const H = bbox.h + q + t;
                const SVG = this.standardSvgNodes(parents);
                surd.toSVG(SVG);
                const dx = this.addRoot(SVG, root, sbox, H);
                const BASE = this.adaptor.append(SVG[0], this.svg('g'));
                base.toSVG([BASE]);
                surd.place(dx, H - sbox.h);
                base.place(dx + sbox.w, 0);
                this.adaptor.append(SVG[SVG.length - 1], this.svg('rect', {
                    width: this.fixed(bbox.w),
                    height: this.fixed(t),
                    x: this.fixed(dx + sbox.w),
                    y: this.fixed(H - t),
                }));
            }
        },
        _a.kind = MmlMsqrt.prototype.kind,
        _a;
})();
//# sourceMappingURL=msqrt.js.map