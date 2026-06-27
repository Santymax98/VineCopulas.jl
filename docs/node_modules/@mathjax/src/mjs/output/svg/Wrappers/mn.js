import { SvgWrapper } from '../Wrapper.js';
import { CommonMnMixin, } from '../../common/Wrappers/mn.js';
import { MmlMn } from '../../../core/MmlTree/MmlNodes/mn.js';
export const SvgMn = (function () {
    var _a;
    const Base = CommonMnMixin(SvgWrapper);
    return _a = class SvgMn extends Base {
        },
        _a.kind = MmlMn.prototype.kind,
        _a;
})();
//# sourceMappingURL=mn.js.map