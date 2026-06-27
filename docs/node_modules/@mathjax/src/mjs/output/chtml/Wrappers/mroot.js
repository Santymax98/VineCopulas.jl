import { CommonMrootMixin, } from '../../common/Wrappers/mroot.js';
import { ChtmlMsqrt } from './msqrt.js';
import { MmlMroot } from '../../../core/MmlTree/MmlNodes/mroot.js';
export const ChtmlMroot = (function () {
    var _a;
    const Base = CommonMrootMixin(ChtmlMsqrt);
    return _a = class ChtmlMroot extends Base {
            addRoot(ROOT, root, sbox, H) {
                root.toCHTML([ROOT]);
                const adaptor = this.adaptor;
                const [x, h, dx] = this.getRootDimens(sbox, H);
                adaptor.setStyle(ROOT, 'verticalAlign', this.em(h));
                adaptor.setStyle(ROOT, 'width', this.em(x));
                if (dx) {
                    adaptor.setStyle(adaptor.firstChild(ROOT), 'paddingLeft', this.em(dx));
                }
            }
        },
        _a.kind = MmlMroot.prototype.kind,
        _a;
})();
//# sourceMappingURL=mroot.js.map