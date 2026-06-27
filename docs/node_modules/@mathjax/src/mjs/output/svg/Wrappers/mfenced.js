import { SvgWrapper } from '../Wrapper.js';
import { CommonMfencedMixin, } from '../../common/Wrappers/mfenced.js';
import { MmlMfenced } from '../../../core/MmlTree/MmlNodes/mfenced.js';
export const SvgMfenced = (function () {
    var _a;
    const Base = CommonMfencedMixin(SvgWrapper);
    return _a = class SvgMfenced extends Base {
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents);
                this.setChildrenParent(this.mrow);
                this.mrow.toSVG(svg);
                this.setChildrenParent(this);
            }
            setChildrenParent(parent) {
                for (const child of this.childNodes) {
                    child.parent = parent;
                }
            }
        },
        _a.kind = MmlMfenced.prototype.kind,
        _a;
})();
//# sourceMappingURL=mfenced.js.map