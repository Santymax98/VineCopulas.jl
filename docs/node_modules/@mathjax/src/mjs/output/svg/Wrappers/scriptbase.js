import { SvgWrapper } from '../Wrapper.js';
import { CommonScriptbaseMixin, } from '../../common/Wrappers/scriptbase.js';
export const SvgScriptbase = (function () {
    var _a;
    const Base = CommonScriptbaseMixin(SvgWrapper);
    return _a = class SvgScriptbase extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                const w = this.getBaseWidth();
                const [x, v] = this.getOffset();
                this.baseChild.toSVG(svg);
                this.baseChild.place(0, 0);
                this.scriptChild.toSVG([svg[svg.length - 1]]);
                this.scriptChild.place(w + x, v);
            }
        },
        _a.kind = 'scriptbase',
        _a;
})();
//# sourceMappingURL=scriptbase.js.map