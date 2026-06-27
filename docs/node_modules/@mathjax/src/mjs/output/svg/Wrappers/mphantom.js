import { SvgWrapper } from '../Wrapper.js';
import { MmlMphantom } from '../../../core/MmlTree/MmlNodes/mphantom.js';
export const SvgMphantom = (function () {
    var _a;
    return _a = class SvgMphantom extends SvgWrapper {
            toSVG(parents) {
                this.standardSvgNodes(parents);
            }
        },
        _a.kind = MmlMphantom.prototype.kind,
        _a;
})();
//# sourceMappingURL=mphantom.js.map