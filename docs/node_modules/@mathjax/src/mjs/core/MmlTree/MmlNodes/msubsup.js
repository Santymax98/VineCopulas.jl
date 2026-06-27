import { AbstractMmlBaseNode } from '../MmlNode.js';
export class MmlMsubsup extends AbstractMmlBaseNode {
    get kind() {
        return 'msubsup';
    }
    get arity() {
        return 3;
    }
    get base() {
        return 0;
    }
    get sub() {
        return 1;
    }
    get sup() {
        return 2;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        const nodes = this.childNodes;
        nodes[0].setInheritedAttributes(attributes, display, level, prime);
        nodes[1].setInheritedAttributes(attributes, false, level + 1, prime || this.sub === 1);
        if (!nodes[2]) {
            return;
        }
        nodes[2].setInheritedAttributes(attributes, false, level + 1, prime || this.sub === 2);
    }
}
MmlMsubsup.defaults = Object.assign(Object.assign({}, AbstractMmlBaseNode.defaults), { subscriptshift: '', superscriptshift: '' });
export class MmlMsub extends MmlMsubsup {
    get kind() {
        return 'msub';
    }
    get arity() {
        return 2;
    }
}
MmlMsub.defaults = Object.assign({}, MmlMsubsup.defaults);
export class MmlMsup extends MmlMsubsup {
    get kind() {
        return 'msup';
    }
    get arity() {
        return 2;
    }
    get sup() {
        return 1;
    }
    get sub() {
        return 2;
    }
}
MmlMsup.defaults = Object.assign({}, MmlMsubsup.defaults);
//# sourceMappingURL=msubsup.js.map