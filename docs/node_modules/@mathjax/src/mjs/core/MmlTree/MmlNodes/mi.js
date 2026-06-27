import { AbstractMmlTokenNode, TEXCLASS, } from '../MmlNode.js';
export class MmlMi extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mi';
    }
    setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
        super.setInheritedAttributes(attributes, display, level, prime);
        const text = this.getText();
        if (text.match(MmlMi.singleCharacter) && !attributes.mathvariant) {
            this.attributes.setInherited('mathvariant', 'italic');
        }
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        const name = this.getText();
        if (name.length > 1 &&
            name.match(MmlMi.operatorName) &&
            this.attributes.get('mathvariant') === 'normal' &&
            this.getProperty('autoOP') === undefined &&
            this.getProperty('texClass') === undefined) {
            this.texClass = TEXCLASS.OP;
            this.setProperty('autoOP', true);
        }
        return this;
    }
}
MmlMi.defaults = Object.assign({}, AbstractMmlTokenNode.defaults);
MmlMi.operatorName = /^[a-z][a-z0-9]*$/i;
MmlMi.singleCharacter = /^[\uD800-\uDBFF]?.[\u0300-\u036F\u1AB0-\u1ABE\u1DC0-\u1DFF\u20D0-\u20EF]*$/;
//# sourceMappingURL=mi.js.map