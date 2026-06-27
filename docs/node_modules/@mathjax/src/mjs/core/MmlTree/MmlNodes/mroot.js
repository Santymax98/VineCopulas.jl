import { AbstractMmlNode, TEXCLASS, } from '../MmlNode.js';
export class MmlMroot extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mroot';
    }
    get arity() {
        return 2;
    }
    get linebreakContainer() {
        return true;
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        this.childNodes[0].setTeXclass(null);
        this.childNodes[1].setTeXclass(null);
        return this;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        this.childNodes[0].setInheritedAttributes(attributes, display, level, true);
        this.childNodes[1].setInheritedAttributes(attributes, false, level + 2, prime);
    }
}
MmlMroot.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { 'data-vertical-align': 'bottom' });
//# sourceMappingURL=mroot.js.map