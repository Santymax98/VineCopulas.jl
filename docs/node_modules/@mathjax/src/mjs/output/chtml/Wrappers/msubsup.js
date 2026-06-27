import { CommonMsubMixin, CommonMsupMixin, CommonMsubsupMixin, } from '../../common/Wrappers/msubsup.js';
import { ChtmlScriptbase, } from './scriptbase.js';
import { MmlMsubsup, MmlMsub, MmlMsup, } from '../../../core/MmlTree/MmlNodes/msubsup.js';
export const ChtmlMsub = (function () {
    var _a;
    const Base = CommonMsubMixin(ChtmlScriptbase);
    return _a = class ChtmlMsub extends Base {
        },
        _a.kind = MmlMsub.prototype.kind,
        _a;
})();
export const ChtmlMsup = (function () {
    var _a;
    const Base = CommonMsupMixin(ChtmlScriptbase);
    return _a = class ChtmlMsup extends Base {
        },
        _a.kind = MmlMsup.prototype.kind,
        _a;
})();
export const ChtmlMsubsup = (function () {
    var _a;
    const Base = CommonMsubsupMixin(ChtmlScriptbase);
    return _a = class ChtmlMsubsup extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                const adaptor = this.adaptor;
                const chtml = this.standardChtmlNodes(parents);
                const [base, sup, sub] = [this.baseChild, this.supChild, this.subChild];
                const [, v, q] = this.getUVQ();
                const style = { 'vertical-align': this.em(v) };
                base.toCHTML(chtml);
                const stack = adaptor.append(chtml[chtml.length - 1], this.html('mjx-script', { style }));
                sup.toCHTML([stack]);
                adaptor.append(stack, this.html('mjx-spacer', { style: { 'margin-top': this.em(q) } }));
                sub.toCHTML([stack]);
                const ic = this.getAdjustedIc();
                if (ic) {
                    adaptor.setStyle(sup.dom[0], 'marginLeft', this.em(ic / sup.bbox.rscale));
                    if (!this.baseIsChar) {
                        adaptor.setStyle(sub.dom[0], 'marginLeft', this.em(ic / sup.bbox.rscale));
                    }
                }
                if (this.baseRemoveIc) {
                    adaptor.setStyle(stack, 'marginLeft', this.em(-this.baseIc));
                }
            }
        },
        _a.kind = MmlMsubsup.prototype.kind,
        _a.styles = {
            'mjx-script': {
                display: 'inline-block',
                'padding-right': '.05em',
                'padding-left': '.033em',
            },
            'mjx-script > mjx-spacer': {
                display: 'block',
            },
        },
        _a;
})();
//# sourceMappingURL=msubsup.js.map