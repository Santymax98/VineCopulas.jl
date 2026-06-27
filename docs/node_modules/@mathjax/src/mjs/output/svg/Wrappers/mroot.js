import { CommonMrootMixin, } from '../../common/Wrappers/mroot.js';
import { MmlMroot } from '../../../core/MmlTree/MmlNodes/mroot.js';
import { SvgMsqrt } from './msqrt.js';
export const SvgMroot = (function () {
    var _a;
    const Base = CommonMrootMixin(SvgMsqrt);
    return _a = class SvgMroot extends Base {
            addRoot(ROOT, root, sbox, H) {
                root.toSVG(ROOT);
                const [x, h, dx] = this.getRootDimens(sbox, H);
                const bbox = root.getOuterBBox();
                root.place(dx * bbox.rscale, h);
                return x;
            }
        },
        _a.kind = MmlMroot.prototype.kind,
        _a;
})();
//# sourceMappingURL=mroot.js.map