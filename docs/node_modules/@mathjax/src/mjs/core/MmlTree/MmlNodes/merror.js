import { AbstractMmlNode, TEXCLASS } from '../MmlNode.js';
export class MmlMerror extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'merror';
    }
    get arity() {
        return -1;
    }
    get linebreakContainer() {
        return true;
    }
}
MmlMerror.defaults = Object.assign({}, AbstractMmlNode.defaults);
//# sourceMappingURL=merror.js.map