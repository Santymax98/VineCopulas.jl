import { AbstractMmlNode } from '../MmlNode.js';
export class MmlMalignmark extends AbstractMmlNode {
    get kind() {
        return 'malignmark';
    }
    get arity() {
        return 0;
    }
    get isSpacelike() {
        return true;
    }
}
MmlMalignmark.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { edge: 'left' });
//# sourceMappingURL=malignmark.js.map