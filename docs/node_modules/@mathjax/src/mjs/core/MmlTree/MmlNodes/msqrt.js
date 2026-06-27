import { AbstractMmlNode, TEXCLASS, } from '../MmlNode.js';
export class MmlMsqrt extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'msqrt';
    }
    get arity() {
        return -1;
    }
    get linebreakContainer() {
        return true;
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        this.childNodes[0].setTeXclass(null);
        return this;
    }
    setChildInheritedAttributes(attributes, display, level, _prime) {
        this.childNodes[0].setInheritedAttributes(attributes, display, level, true);
    }
}
MmlMsqrt.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { 'data-vertical-align': 'bottom' });
//# sourceMappingURL=msqrt.js.map