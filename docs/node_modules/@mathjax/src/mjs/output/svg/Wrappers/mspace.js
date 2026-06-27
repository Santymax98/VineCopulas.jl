import { SvgWrapper } from '../Wrapper.js';
import { CommonMspaceMixin, } from '../../common/Wrappers/mspace.js';
import { MmlMspace } from '../../../core/MmlTree/MmlNodes/mspace.js';
export const SvgMspace = (function () {
    var _a;
    const Base = CommonMspaceMixin(SvgWrapper);
    return _a = class SvgMspace extends Base {
        },
        _a.kind = MmlMspace.prototype.kind,
        _a;
})();
//# sourceMappingURL=mspace.js.map