import { AbstractMmlNode } from '../MmlNode.js';
export class MmlMaction extends AbstractMmlNode {
    get kind() {
        return 'maction';
    }
    get arity() {
        return 1;
    }
    get selected() {
        const selection = this.attributes.get('selection');
        const i = Math.max(1, Math.min(this.childNodes.length, selection)) - 1;
        return this.childNodes[i] || this.factory.create('mrow');
    }
    get isEmbellished() {
        return this.selected.isEmbellished;
    }
    get isSpacelike() {
        return this.selected.isSpacelike;
    }
    core() {
        return this.selected.core();
    }
    coreMO() {
        return this.selected.coreMO();
    }
    verifyAttributes(options) {
        super.verifyAttributes(options);
        if (this.attributes.get('actiontype') !== 'toggle' &&
            this.attributes.hasExplicit('selection')) {
            this.attributes.unset('selection');
        }
    }
    setTeXclass(prev) {
        if (this.attributes.get('actiontype') === 'tooltip' && this.childNodes[1]) {
            this.childNodes[1].setTeXclass(null);
        }
        const selected = this.selected;
        prev = selected.setTeXclass(prev);
        this.updateTeXclass(selected);
        return prev;
    }
    nextToggleSelection() {
        let selection = Math.max(1, parseInt(this.attributes.get('selection')) + 1);
        if (selection > this.childNodes.length) {
            selection = 1;
        }
        this.attributes.set('selection', selection);
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        var _a, _b;
        if (this.attributes.get('actiontype').toLowerCase() !== 'tooltip') {
            super.setChildInheritedAttributes(attributes, display, level, prime);
            return;
        }
        (_a = this.childNodes[0]) === null || _a === void 0 ? void 0 : _a.setInheritedAttributes(attributes, display, level, prime);
        (_b = this.childNodes[1]) === null || _b === void 0 ? void 0 : _b.setInheritedAttributes(attributes, false, 1, false);
    }
}
MmlMaction.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { actiontype: 'toggle', selection: 1 });
//# sourceMappingURL=maction.js.map