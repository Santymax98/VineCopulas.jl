import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMnMixin, } from '../../common/Wrappers/mn.js';
import { MmlMn } from '../../../core/MmlTree/MmlNodes/mn.js';
export const ChtmlMn = (function () {
    var _a;
    const Base = CommonMnMixin(ChtmlWrapper);
    return _a = class ChtmlMn extends Base {
        },
        _a.kind = MmlMn.prototype.kind,
        _a;
})();
//# sourceMappingURL=mn.js.map