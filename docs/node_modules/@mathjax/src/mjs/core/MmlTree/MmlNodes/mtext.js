import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMtext extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mtext';
    }
    get isSpacelike() {
        return (!!this.getText().match(/^\s*$/) &&
            !this.attributes.hasOneOf(MmlMtext.NONSPACELIKE));
    }
}
MmlMtext.NONSPACELIKE = ['style', 'mathbackground', 'background'];
MmlMtext.defaults = Object.assign({}, AbstractMmlTokenNode.defaults);
//# sourceMappingURL=mtext.js.map