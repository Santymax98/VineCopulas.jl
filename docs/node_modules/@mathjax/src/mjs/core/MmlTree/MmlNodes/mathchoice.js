import { AbstractMmlBaseNode } from '../MmlNode.js';
export class MathChoice extends AbstractMmlBaseNode {
    get kind() {
        return 'MathChoice';
    }
    get arity() {
        return 4;
    }
    get notParent() {
        return true;
    }
    setInheritedAttributes(attributes, display, level, prime) {
        const selection = display ? 0 : Math.max(0, Math.min(level, 2)) + 1;
        const child = this.childNodes[selection] || this.factory.create('mrow');
        this.parent.replaceChild(child, this);
        child.setInheritedAttributes(attributes, display, level, prime);
    }
}
MathChoice.defaults = Object.assign({}, AbstractMmlBaseNode.defaults);
//# sourceMappingURL=mathchoice.js.map