import { AbstractMmlNode, TEXCLASS } from '../MmlNode.js';
export class MmlMenclose extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'menclose';
    }
    get arity() {
        return -1;
    }
    get linebreakContainer() {
        return true;
    }
    setTeXclass(prev) {
        prev = this.childNodes[0].setTeXclass(prev);
        this.updateTeXclass(this.childNodes[0]);
        return prev;
    }
}
MmlMenclose.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { notation: 'longdiv' });
//# sourceMappingURL=menclose.js.map