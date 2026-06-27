import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMiMixin, } from '../../common/Wrappers/mi.js';
import { MmlMi } from '../../../core/MmlTree/MmlNodes/mi.js';
export const ChtmlMi = (function () {
    var _a;
    const Base = CommonMiMixin(ChtmlWrapper);
    return _a = class ChtmlMi extends Base {
        },
        _a.kind = MmlMi.prototype.kind,
        _a;
})();
//# sourceMappingURL=mi.js.map