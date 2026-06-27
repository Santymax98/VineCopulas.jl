import { XMLNode } from '../MmlNode.js';
export class HtmlNode extends XMLNode {
    get kind() {
        return 'html';
    }
    getHTML() {
        return this.getXML();
    }
    setHTML(html, adaptor = null) {
        try {
            adaptor.getAttribute(html, 'data-mjx-hdw');
        }
        catch (_error) {
            html = adaptor.node('span', {}, [html]);
        }
        return this.setXML(html, adaptor);
    }
    getSerializedHTML() {
        return this.adaptor.outerHTML(this.xml);
    }
    textContent() {
        return this.adaptor.textContent(this.xml);
    }
    toString() {
        const kind = this.adaptor.kind(this.xml);
        return `HTML=<${kind}>...</${kind}>`;
    }
    verifyTree(options) {
        if (this.parent && !this.parent.isToken) {
            this.mError('HTML can only be a child of a token element', options, true);
            return;
        }
    }
}
//# sourceMappingURL=HtmlNode.js.map