import { AbstractMmlLayoutNode, TEXCLASS } from '../MmlNode.js';
export class MmlMpadded extends AbstractMmlLayoutNode {
    get kind() {
        return 'mpadded';
    }
    get linebreakContainer() {
        return true;
    }
    setTeXclass(prev) {
        if (!this.getProperty('vbox')) {
            return super.setTeXclass(prev);
        }
        this.getPrevClass(prev);
        this.texClass = TEXCLASS.ORD;
        this.childNodes[0].setTeXclass(null);
        return this;
    }
}
MmlMpadded.defaults = Object.assign(Object.assign({}, AbstractMmlLayoutNode.defaults), { width: '', height: '', depth: '', lspace: 0, voffset: 0 });
//# sourceMappingURL=mpadded.js.map