import { AbstractMmlLayoutNode } from '../MmlNode.js';
export class MmlMath extends AbstractMmlLayoutNode {
    get kind() {
        return 'math';
    }
    get linebreakContainer() {
        return true;
    }
    get linebreakAlign() {
        return '';
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        if (this.attributes.get('mode') === 'display') {
            this.attributes.setInherited('display', 'block');
        }
        attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
        display =
            !!this.attributes.get('displaystyle') ||
                (!this.attributes.get('displaystyle') &&
                    this.attributes.get('display') === 'block');
        this.attributes.setInherited('displaystyle', display);
        level = (this.attributes.get('scriptlevel') ||
            this.constructor.defaults['scriptlevel']);
        super.setChildInheritedAttributes(attributes, display, level, prime);
    }
    verifyTree(options = null) {
        super.verifyTree(options);
        if (this.parent) {
            this.mError('Improper nesting of math tags', options, true);
        }
    }
}
MmlMath.defaults = Object.assign(Object.assign({}, AbstractMmlLayoutNode.defaults), { mathvariant: 'normal', mathsize: 'normal', mathcolor: '', mathbackground: 'transparent', dir: 'ltr', scriptlevel: 0, displaystyle: false, display: 'inline', maxwidth: '', overflow: 'linebreak', altimg: '', 'altimg-width': '', 'altimg-height': '', 'altimg-valign': '', alttext: '', cdgroup: '', scriptsizemultiplier: 1 / Math.sqrt(2), scriptminsize: '.4em', infixlinebreakstyle: 'before', lineleading: '100%', linebreakmultchar: '\u2062', indentshift: 'auto', indentalign: 'auto', indenttarget: '', indentalignfirst: 'indentalign', indentshiftfirst: 'indentshift', indentalignlast: 'indentalign', indentshiftlast: 'indentshift' });
//# sourceMappingURL=math.js.map