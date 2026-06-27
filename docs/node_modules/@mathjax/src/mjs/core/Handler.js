import { AbstractMathDocument, } from './MathDocument.js';
class DefaultMathDocument extends AbstractMathDocument {
}
export class AbstractHandler {
    constructor(adaptor, priority = 5) {
        this.documentClass = DefaultMathDocument;
        this.adaptor = adaptor;
        this.priority = priority;
    }
    get name() {
        return this.constructor.NAME;
    }
    handlesDocument(_document) {
        return false;
    }
    create(document, options) {
        return new this.documentClass(document, this.adaptor, options);
    }
}
AbstractHandler.NAME = 'generic';
//# sourceMappingURL=Handler.js.map