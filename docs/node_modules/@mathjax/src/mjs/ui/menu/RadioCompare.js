import { Radio } from './mj-context-menu.js';
export class RadioCompare extends Radio {
    static fromJson(_factory, { content: content, variable: variable, id: id, comparator: comparator, }, menu) {
        return new this(menu, content, variable, id, comparator);
    }
    constructor(menu, content, variable, id, comparator) {
        super(menu, content, variable, id);
        this.comparator = comparator;
        this.role = 'menuitemradiocompare';
    }
    updateAria() {
        this.html.setAttribute('aria-checked', this.comparator(this.variable.getValue(), this.id) ? 'true' : 'false');
    }
    updateSpan() {
        this.span.style.display = this.comparator(this.variable.getValue(), this.id)
            ? ''
            : 'none';
    }
}
//# sourceMappingURL=RadioCompare.js.map