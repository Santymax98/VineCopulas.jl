import { AbstractMmlBaseNode } from '../MmlNode.js';
export class MmlMunderover extends AbstractMmlBaseNode {
    get kind() {
        return 'munderover';
    }
    get arity() {
        return 3;
    }
    get base() {
        return 0;
    }
    get under() {
        return 1;
    }
    get over() {
        return 2;
    }
    get linebreakContainer() {
        return true;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        const nodes = this.childNodes;
        nodes[0].setInheritedAttributes(attributes, display, level, prime || !!nodes[this.over]);
        const force = !!(!display && nodes[0].coreMO().attributes.get('movablelimits'));
        const ACCENTS = this.constructor.ACCENTS;
        nodes[1].setInheritedAttributes(attributes, false, this.getScriptlevel(ACCENTS[1], force, level), prime || this.under === 1);
        this.setInheritedAccent(1, ACCENTS[1], display, level, prime, force);
        if (!nodes[2]) {
            return;
        }
        nodes[2].setInheritedAttributes(attributes, false, this.getScriptlevel(ACCENTS[2], force, level), prime || this.under === 2);
        this.setInheritedAccent(2, ACCENTS[2], display, level, prime, force);
    }
    getScriptlevel(accent, force, level) {
        if (force || !this.attributes.get(accent)) {
            level++;
        }
        return level;
    }
    setInheritedAccent(n, accent, display, level, prime, force) {
        const node = this.childNodes[n];
        if (!this.attributes.hasExplicit(accent) && node.isEmbellished) {
            const value = node.coreMO().attributes.get('accent');
            this.attributes.setInherited(accent, value);
            if (value !== this.attributes.getDefault(accent)) {
                node.setInheritedAttributes({}, display, this.getScriptlevel(accent, force, level), prime);
            }
        }
    }
}
MmlMunderover.defaults = Object.assign(Object.assign({}, AbstractMmlBaseNode.defaults), { accent: false, accentunder: false, align: 'center' });
MmlMunderover.ACCENTS = ['', 'accentunder', 'accent'];
export class MmlMunder extends MmlMunderover {
    get kind() {
        return 'munder';
    }
    get arity() {
        return 2;
    }
}
MmlMunder.defaults = Object.assign({}, MmlMunderover.defaults);
export class MmlMover extends MmlMunderover {
    get kind() {
        return 'mover';
    }
    get arity() {
        return 2;
    }
    get over() {
        return 1;
    }
    get under() {
        return 2;
    }
}
MmlMover.defaults = Object.assign({}, MmlMunderover.defaults);
MmlMover.ACCENTS = ['', 'accent', 'accentunder'];
//# sourceMappingURL=munderover.js.map