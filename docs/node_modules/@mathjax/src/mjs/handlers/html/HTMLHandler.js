import { AbstractHandler } from '../../core/Handler.js';
import { HTMLDocument } from './HTMLDocument.js';
export class HTMLHandler extends AbstractHandler {
    constructor() {
        super(...arguments);
        this.documentClass = HTMLDocument;
    }
    handlesDocument(document) {
        const adaptor = this.adaptor;
        if (typeof document === 'string') {
            try {
                document = adaptor.parse(document, 'text/html');
            }
            catch (_err) {
            }
        }
        if (document instanceof adaptor.window.Document ||
            document instanceof adaptor.window.HTMLElement ||
            document instanceof adaptor.window.DocumentFragment) {
            return true;
        }
        return false;
    }
    create(document, options) {
        const adaptor = this.adaptor;
        if (typeof document === 'string') {
            document = adaptor.parse(document, 'text/html');
        }
        else if (document instanceof adaptor.window.HTMLElement ||
            document instanceof adaptor.window.DocumentFragment) {
            const child = document;
            document = adaptor.parse('', 'text/html');
            adaptor.append(adaptor.body(document), child);
        }
        return super.create(document, options);
    }
}
//# sourceMappingURL=HTMLHandler.js.map