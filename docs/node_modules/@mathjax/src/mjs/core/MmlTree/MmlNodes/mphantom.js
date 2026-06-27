import { AbstractMmlLayoutNode, TEXCLASS } from '../MmlNode.js';
export class MmlMphantom extends AbstractMmlLayoutNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mphantom';
    }
}
MmlMphantom.defaults = Object.assign({}, AbstractMmlLayoutNode.defaults);
//# sourceMappingURL=mphantom.js.map