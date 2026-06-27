import { AbstractMmlLayoutNode } from '../MmlNode.js';
import { INHERIT } from '../Attributes.js';
export class MmlMaligngroup extends AbstractMmlLayoutNode {
    get kind() {
        return 'maligngroup';
    }
    get isSpacelike() {
        return true;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
        super.setChildInheritedAttributes(attributes, display, level, prime);
    }
}
MmlMaligngroup.defaults = Object.assign(Object.assign({}, AbstractMmlLayoutNode.defaults), { groupalign: INHERIT });
//# sourceMappingURL=maligngroup.js.map