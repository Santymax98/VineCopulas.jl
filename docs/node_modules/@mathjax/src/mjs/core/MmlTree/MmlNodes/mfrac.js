import { AbstractMmlBaseNode } from '../MmlNode.js';
export class MmlMfrac extends AbstractMmlBaseNode {
    get kind() {
        return 'mfrac';
    }
    get arity() {
        return 2;
    }
    get linebreakContainer() {
        return true;
    }
    get linebreakAlign() {
        return '';
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        for (const child of this.childNodes) {
            child.setTeXclass(null);
        }
        return this;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        if (!display || level > 0) {
            level++;
        }
        const numalign = this.attributes.get('numalign');
        const denalign = this.attributes.get('denomalign');
        const numAttributes = this.addInheritedAttributes(Object.assign({}, attributes), {
            numalign,
            indentshift: '0',
            indentalignfirst: numalign,
            indentshiftfirst: '0',
            indentalignlast: 'indentalign',
            indentshiftlast: 'indentshift',
        });
        const denAttributes = this.addInheritedAttributes(Object.assign({}, attributes), {
            denalign,
            indentshift: '0',
            indentalignfirst: denalign,
            indentshiftfirst: '0',
            indentalignlast: 'indentalign',
            indentshiftlast: 'indentshift',
        });
        this.childNodes[0].setInheritedAttributes(numAttributes, false, level, prime);
        this.childNodes[1].setInheritedAttributes(denAttributes, false, level, true);
    }
}
MmlMfrac.defaults = Object.assign(Object.assign({}, AbstractMmlBaseNode.defaults), { linethickness: 'medium', numalign: 'center', denomalign: 'center', bevelled: false });
//# sourceMappingURL=mfrac.js.map