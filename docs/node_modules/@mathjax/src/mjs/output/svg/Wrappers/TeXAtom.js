import { SvgWrapper } from '../Wrapper.js';
import { CommonTeXAtomMixin, } from '../../common/Wrappers/TeXAtom.js';
import { TeXAtom } from '../../../core/MmlTree/MmlNodes/TeXAtom.js';
import { TEXCLASSNAMES } from '../../../core/MmlTree/MmlNode.js';
export const SvgTeXAtom = (function () {
    var _a;
    const Base = CommonTeXAtomMixin(SvgWrapper);
    return _a = class SvgTeXAtom extends Base {
            toSVG(parents) {
                super.toSVG(parents);
                this.adaptor.setAttribute(this.dom[0], 'data-mjx-texclass', TEXCLASSNAMES[this.node.texClass]);
            }
        },
        _a.kind = TeXAtom.prototype.kind,
        _a;
})();
//# sourceMappingURL=TeXAtom.js.map