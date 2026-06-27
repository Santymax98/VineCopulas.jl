import { AbstractMmlNode, AbstractMmlBaseNode } from '../MmlNode.js';
export class MmlSemantics extends AbstractMmlBaseNode {
    get kind() {
        return 'semantics';
    }
    get arity() {
        return 1;
    }
    get notParent() {
        return true;
    }
}
MmlSemantics.defaults = Object.assign(Object.assign({}, AbstractMmlBaseNode.defaults), { definitionUrl: null, encoding: null });
export class MmlAnnotationXML extends AbstractMmlNode {
    get kind() {
        return 'annotation-xml';
    }
    setChildInheritedAttributes() { }
}
MmlAnnotationXML.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { definitionUrl: null, encoding: null, cd: 'mathmlkeys', name: '', src: null });
export class MmlAnnotation extends MmlAnnotationXML {
    constructor() {
        super(...arguments);
        this.properties = {
            isChars: true,
        };
    }
    get kind() {
        return 'annotation';
    }
}
MmlAnnotation.defaults = Object.assign({}, MmlAnnotationXML.defaults);
//# sourceMappingURL=semantics.js.map