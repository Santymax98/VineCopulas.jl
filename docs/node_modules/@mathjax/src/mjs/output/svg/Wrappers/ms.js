import { SvgWrapper } from '../Wrapper.js';
import { CommonMsMixin, } from '../../common/Wrappers/ms.js';
import { MmlMs } from '../../../core/MmlTree/MmlNodes/ms.js';
export const SvgMs = (function () {
    var _a;
    const Base = CommonMsMixin(SvgWrapper);
    return _a = class SvgMs extends Base {
        },
        _a.kind = MmlMs.prototype.kind,
        _a;
})();
//# sourceMappingURL=ms.js.map