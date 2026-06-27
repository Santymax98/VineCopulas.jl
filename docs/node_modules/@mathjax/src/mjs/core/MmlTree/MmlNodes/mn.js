import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMn extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mn';
    }
}
MmlMn.defaults = Object.assign({}, AbstractMmlTokenNode.defaults);
//# sourceMappingURL=mn.js.map