import { CommonMsubMixin, CommonMsupMixin, CommonMsubsupMixin, } from '../../common/Wrappers/msubsup.js';
import { SvgScriptbase, } from './scriptbase.js';
import { MmlMsubsup, MmlMsub, MmlMsup, } from '../../../core/MmlTree/MmlNodes/msubsup.js';
export const SvgMsub = (function () {
    var _a;
    const Base = CommonMsubMixin(SvgScriptbase);
    return _a = class SvgMsub extends Base {
        },
        _a.kind = MmlMsub.prototype.kind,
        _a;
})();
export const SvgMsup = (function () {
    var _a;
    const Base = CommonMsupMixin(SvgScriptbase);
    return _a = class SvgMsup extends Base {
        },
        _a.kind = MmlMsup.prototype.kind,
        _a;
})();
export const SvgMsubsup = (function () {
    var _a;
    const Base = CommonMsubsupMixin(SvgScriptbase);
    return _a = class SvgMsubsup extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                const [base, sup, sub] = [this.baseChild, this.supChild, this.subChild];
                const w = this.getBaseWidth();
                const x = this.getAdjustedIc();
                const [u, v] = this.getUVQ();
                base.toSVG(svg);
                const tail = [svg[svg.length - 1]];
                sup.toSVG(tail);
                sub.toSVG(tail);
                base.place(0, 0);
                sub.place(w + (this.baseIsChar ? 0 : x), v);
                sup.place(w + x, u);
            }
        },
        _a.kind = MmlMsubsup.prototype.kind,
        _a;
})();
//# sourceMappingURL=msubsup.js.map