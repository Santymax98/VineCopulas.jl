import { AbstractMmlBaseNode } from '../MmlNode.js';
import { INHERIT } from '../Attributes.js';
export class MmlMtd extends AbstractMmlBaseNode {
    get kind() {
        return 'mtd';
    }
    get arity() {
        return -1;
    }
    get linebreakContainer() {
        return true;
    }
    get linebreakAlign() {
        return 'columnalign';
    }
    verifyChildren(options) {
        if (this.parent && !this.parent.isKind('mtr')) {
            this.mError(this.kind + ' can only be a child of an mtr or mlabeledtr', options, true);
            return;
        }
        super.verifyChildren(options);
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        this.childNodes[0].setTeXclass(null);
        return this;
    }
}
MmlMtd.defaults = Object.assign(Object.assign({}, AbstractMmlBaseNode.defaults), { rowspan: 1, columnspan: 1, rowalign: INHERIT, columnalign: INHERIT, groupalign: INHERIT, 'data-vertical-align': 'top' });
//# sourceMappingURL=mtd.js.map