import { ChtmlWrapper } from '../Wrapper.js';
import { CommonTeXAtomMixin, } from '../../common/Wrappers/TeXAtom.js';
import { TeXAtom } from '../../../core/MmlTree/MmlNodes/TeXAtom.js';
import { TEXCLASSNAMES } from '../../../core/MmlTree/MmlNode.js';
export const ChtmlTeXAtom = (function () {
    var _a;
    const Base = CommonTeXAtomMixin(ChtmlWrapper);
    return _a = class ChtmlTeXAtom extends Base {
            toCHTML(parents) {
                super.toCHTML(parents);
                this.dom.forEach((dom) => this.adaptor.setAttribute(dom, 'texclass', TEXCLASSNAMES[this.node.texClass]));
            }
        },
        _a.kind = TeXAtom.prototype.kind,
        _a;
})();
//# sourceMappingURL=TeXAtom.js.map