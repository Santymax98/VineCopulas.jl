import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMs extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'ms';
    }
}
MmlMs.defaults = Object.assign(Object.assign({}, AbstractMmlTokenNode.defaults), { lquote: '"', rquote: '"' });
//# sourceMappingURL=ms.js.map