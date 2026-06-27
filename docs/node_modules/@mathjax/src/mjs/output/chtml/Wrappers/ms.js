import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMsMixin, } from '../../common/Wrappers/ms.js';
import { MmlMs } from '../../../core/MmlTree/MmlNodes/ms.js';
export const ChtmlMs = (function () {
    var _a;
    const Base = CommonMsMixin(ChtmlWrapper);
    return _a = class ChtmlMs extends Base {
        },
        _a.kind = MmlMs.prototype.kind,
        _a;
})();
//# sourceMappingURL=ms.js.map