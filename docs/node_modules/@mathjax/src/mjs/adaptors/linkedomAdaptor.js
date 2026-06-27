import { HTMLAdaptor } from './HTMLAdaptor.js';
import { NodeMixin } from './NodeMixin.js';
export class LinkedomAdaptor extends NodeMixin(HTMLAdaptor) {
    parse(text, format = 'text/html') {
        if (!text.match(/^(?:\s|\n)*</))
            text = '<html>' + text + '</html>';
        return this.parser.parseFromString(text, format);
    }
    serializeXML(node) {
        return this.outerHTML(node);
    }
}
export function linkedomAdaptor(parseHTML, options = null) {
    const window = parseHTML('<html></html>');
    window.HTMLCollection = class {
    };
    window.Text.prototype.splitText = function (offset) {
        const text = this.data;
        if (offset > text.length) {
            throw Error('Index Size Error');
        }
        const newNode = window.document.createTextNode(text.substring(offset));
        this.parentNode.insertBefore(newNode, this.nextSibling);
        this.data = text.substring(0, offset);
        return newNode;
    };
    return new LinkedomAdaptor(window, options);
}
//# sourceMappingURL=linkedomAdaptor.js.map