import { AbstractMmlNode } from '../MmlNode.js';
import { INHERIT } from '../Attributes.js';
import { split } from '../../../util/string.js';
export class MmlMtr extends AbstractMmlNode {
    get kind() {
        return 'mtr';
    }
    get linebreakContainer() {
        return true;
    }
    get linebreakAlign() {
        return '';
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        for (const child of this.childNodes) {
            if (!child.isKind('mtd')) {
                this.replaceChild(this.factory.create('mtd'), child).appendChild(child);
            }
        }
        const calign = split(this.attributes.get('columnalign'));
        const balign = split(this.attributes.get('data-break-align'));
        if (this.arity === 1) {
            calign.unshift(this.parent.attributes.get('side'));
            balign.unshift('top');
        }
        attributes = this.addInheritedAttributes(attributes, {
            rowalign: this.attributes.get('rowalign'),
            columnalign: 'center',
            'data-break-align': 'top',
        });
        for (const child of this.childNodes) {
            attributes.columnalign[1] = calign.shift() || attributes.columnalign[1];
            attributes['data-vertical-align'] = [
                this.kind,
                balign.shift() || attributes['data-break-align'][1],
            ];
            child.setInheritedAttributes(attributes, display, level, prime);
        }
    }
    verifyChildren(options) {
        if (this.parent && !this.parent.isKind('mtable')) {
            this.mError(this.kind + ' can only be a child of an mtable', options, true);
            return;
        }
        for (const child of this.childNodes) {
            if (!child.isKind('mtd')) {
                const mtd = this.replaceChild(this.factory.create('mtd'), child);
                mtd.appendChild(child);
                if (!options['fixMtables']) {
                    child.mError('Children of ' + this.kind + ' must be mtd', options);
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
MmlMtr.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { rowalign: INHERIT, columnalign: INHERIT, groupalign: INHERIT, 'data-break-align': 'top' });
export class MmlMlabeledtr extends MmlMtr {
    get kind() {
        return 'mlabeledtr';
    }
    get arity() {
        return 1;
    }
}
//# sourceMappingURL=mtr.js.map