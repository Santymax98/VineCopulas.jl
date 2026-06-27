import { AbstractMmlBaseNode, TEXCLASS } from '../MmlNode.js';
import { MmlMo } from './mo.js';
export class TeXAtom extends AbstractMmlBaseNode {
    get kind() {
        return 'TeXAtom';
    }
    get arity() {
        return -1;
    }
    get notParent() {
        return true;
    }
    constructor(factory, attributes, children) {
        super(factory, attributes, children);
        this.texclass = TEXCLASS.ORD;
        this.setProperty('texClass', this.texClass);
    }
    setTeXclass(prev) {
        this.childNodes[0].setTeXclass(null);
        return this.adjustTeXclass(prev);
    }
    adjustTeXclass(prev) {
        return prev;
    }
}
TeXAtom.defaults = Object.assign({}, AbstractMmlBaseNode.defaults);
TeXAtom.prototype.adjustTeXclass = MmlMo.prototype.adjustTeXclass;
//# sourceMappingURL=TeXAtom.js.map