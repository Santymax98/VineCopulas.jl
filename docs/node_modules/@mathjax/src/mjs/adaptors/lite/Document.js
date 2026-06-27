import { LiteElement } from './Element.js';
export class LiteDocument {
    get kind() {
        return '#document';
    }
    constructor(window = null) {
        this.defaultView = null;
        this.root = new LiteElement('html', {}, [
            (this.head = new LiteElement('head')),
            (this.body = new LiteElement('body')),
        ]);
        this.type = '';
        this.defaultView = window;
    }
}
//# sourceMappingURL=Document.js.map