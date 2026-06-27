import { AbstractMmlNode, TEXCLASS, indentAttributes, } from '../MmlNode.js';
import { split } from '../../../util/string.js';
export class MmlMtable extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.properties = {
            useHeight: true,
        };
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mtable';
    }
    get linebreakContainer() {
        return true;
    }
    get linebreakAlign() {
        return '';
    }
    setInheritedAttributes(attributes, display, level, prime) {
        for (const name of indentAttributes) {
            if (attributes[name]) {
                this.attributes.setInherited(name, attributes[name][1]);
            }
            if (this.attributes.hasExplicit(name)) {
                this.attributes.unset(name);
            }
        }
        super.setInheritedAttributes(attributes, display, level, prime);
    }
    setChildInheritedAttributes(attributes, display, level, _prime) {
        for (const child of this.childNodes) {
            if (!child.isKind('mtr')) {
                this.replaceChild(this.factory.create('mtr'), child).appendChild(child);
            }
        }
        display = !!(this.attributes.getExplicit('displaystyle') ||
            this.attributes.getDefault('displaystyle'));
        attributes = this.addInheritedAttributes(attributes, {
            columnalign: this.attributes.get('columnalign'),
            rowalign: 'center',
            'data-break-align': this.attributes.get('data-break-align'),
        });
        const cramped = this.attributes.getExplicit('data-cramped');
        const ralign = split(this.attributes.get('rowalign'));
        for (const child of this.childNodes) {
            attributes.rowalign[1] = ralign.shift() || attributes.rowalign[1];
            child.setInheritedAttributes(attributes, display, level, !!cramped);
        }
    }
    verifyChildren(options) {
        let mtr = null;
        const factory = this.factory;
        for (let i = 0; i < this.childNodes.length; i++) {
            const child = this.childNodes[i];
            if (child.isKind('mtr')) {
                mtr = null;
            }
            else {
                const isMtd = child.isKind('mtd');
                if (mtr) {
                    this.removeChild(child);
                    i--;
                }
                else {
                    mtr = this.replaceChild(factory.create('mtr'), child);
                }
                mtr.appendChild(isMtd ? child : factory.create('mtd', {}, [child]));
                if (!options['fixMtables']) {
                    child.parent.removeChild(child);
                    child.parent = this;
                    if (isMtd) {
                        mtr.appendChild(factory.create('mtd'));
                    }
                    const merror = child.mError('Children of ' + this.kind + ' must be mtr or mlabeledtr', options, isMtd);
                    mtr.childNodes[mtr.childNodes.length - 1].appendChild(merror);
                }
            }
        }
        super.verifyChildren(options);
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        for (const child of this.childNodes) {
            child.setTeXclass(null);
        }
        return this;
    }
}
MmlMtable.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { align: 'axis', rowalign: 'baseline', columnalign: 'center', groupalign: '{left}', alignmentscope: true, columnwidth: 'auto', width: 'auto', rowspacing: '1ex', columnspacing: '.8em', rowlines: 'none', columnlines: 'none', frame: 'none', framespacing: '0.4em 0.5ex', equalrows: false, equalcolumns: false, displaystyle: false, side: 'right', minlabelspacing: '0.8em', 'data-break-align': 'top' });
//# sourceMappingURL=mtable.js.map