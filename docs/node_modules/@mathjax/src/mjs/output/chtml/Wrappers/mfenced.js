import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMfencedMixin, } from '../../common/Wrappers/mfenced.js';
import { MmlMfenced } from '../../../core/MmlTree/MmlNodes/mfenced.js';
export const ChtmlMfenced = (function () {
    var _a;
    const Base = CommonMfencedMixin(ChtmlWrapper);
    return _a = class ChtmlMfenced extends Base {
            toCHTML(parents) {
                const chtml = this.standardChtmlNodes(parents);
                this.mrow.toCHTML(chtml);
            }
        },
        _a.kind = MmlMfenced.prototype.kind,
        _a;
})();
//# sourceMappingURL=mfenced.js.map