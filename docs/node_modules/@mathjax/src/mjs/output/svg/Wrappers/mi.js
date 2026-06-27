import { SvgWrapper } from '../Wrapper.js';
import { CommonMiMixin, } from '../../common/Wrappers/mi.js';
import { MmlMi } from '../../../core/MmlTree/MmlNodes/mi.js';
export const SvgMi = (function () {
    var _a;
    const Base = CommonMiMixin(SvgWrapper);
    return _a = class SvgMi extends Base {
        },
        _a.kind = MmlMi.prototype.kind,
        _a;
})();
//# sourceMappingURL=mi.js.map