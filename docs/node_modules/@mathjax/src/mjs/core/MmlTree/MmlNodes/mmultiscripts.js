import { AbstractMmlNode } from '../MmlNode.js';
import { MmlMsubsup } from './msubsup.js';
export class MmlMmultiscripts extends MmlMsubsup {
    get kind() {
        return 'mmultiscripts';
    }
    get arity() {
        return 1;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        this.childNodes[0].setInheritedAttributes(attributes, display, level, prime);
        let prescripts = false;
        for (let i = 1, n = 0; i < this.childNodes.length; i++) {
            const child = this.childNodes[i];
            if (child.isKind('mprescripts')) {
                if (!prescripts) {
                    prescripts = true;
                    if (i % 2 === 0) {
                        const none = this.factory.create('none');
                        this.childNodes.splice(i, 0, none);
                        none.parent = this;
                        i++;
                    }
                }
            }
            else {
                const primestyle = prime || n % 2 === 0;
                child.setInheritedAttributes(attributes, false, level + 1, primestyle);
                n++;
            }
        }
        if (this.childNodes.length % 2 === (prescripts ? 1 : 0)) {
            this.appendChild(this.factory.create('none'));
            this.childNodes[this.childNodes.length - 1].setInheritedAttributes(attributes, false, level + 1, prime);
        }
    }
    verifyChildren(options) {
        let prescripts = false;
        const fix = options['fixMmultiscripts'];
        for (let i = 0; i < this.childNodes.length; i++) {
            const child = this.childNodes[i];
            if (child.isKind('mprescripts')) {
                if (prescripts) {
                    child.mError(child.kind + ' can only appear once in ' + this.kind, options, true);
                }
                else {
                    prescripts = true;
                    if (i % 2 === 0 && !fix) {
                        this.mError('There must be an equal number of prescripts of each type', options);
                    }
                }
            }
        }
        if (this.childNodes.length % 2 === (prescripts ? 1 : 0) && !fix) {
            this.mError('There must be an equal number of scripts of each type', options);
        }
        super.verifyChildren(options);
    }
}
MmlMmultiscripts.defaults = Object.assign({}, MmlMsubsup.defaults);
export class MmlMprescripts extends AbstractMmlNode {
    get kind() {
        return 'mprescripts';
    }
    get arity() {
        return 0;
    }
    verifyTree(options) {
        super.verifyTree(options);
        if (this.parent && !this.parent.isKind('mmultiscripts')) {
            this.mError(this.kind + ' must be a child of mmultiscripts', options, true);
        }
    }
}
MmlMprescripts.defaults = Object.assign({}, AbstractMmlNode.defaults);
export class MmlNone extends AbstractMmlNode {
    get kind() {
        return 'none';
    }
    get arity() {
        return 0;
    }
    verifyTree(options) {
        super.verifyTree(options);
        if (this.parent && !this.parent.isKind('mmultiscripts')) {
            this.mError(this.kind + ' must be a child of mmultiscripts', options, true);
        }
    }
}
MmlNone.defaults = Object.assign({}, AbstractMmlNode.defaults);
//# sourceMappingURL=mmultiscripts.js.map