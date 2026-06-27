import { MmlVisitor } from './MmlVisitor.js';
export class MathMLVisitor extends MmlVisitor {
    constructor() {
        super(...arguments);
        this.document = null;
    }
    visitTree(node, document) {
        this.document = document;
        const root = document.createElement('top');
        this.visitNode(node, root);
        this.document = null;
        return root.firstChild;
    }
    visitTextNode(node, parent) {
        parent.appendChild(this.document.createTextNode(node.getText()));
    }
    visitXMLNode(node, parent) {
        parent.appendChild(node.getXML().cloneNode(true));
    }
    visitHtmlNode(node, parent) {
        parent.appendChild(node.getHTML().cloneNode(true));
    }
    visitInferredMrowNode(node, parent) {
        for (const child of node.childNodes) {
            this.visitNode(child, parent);
        }
    }
    visitDefault(node, parent) {
        const mml = this.document.createElement(this.getKind(node));
        this.addAttributes(node, mml);
        for (const child of node.childNodes) {
            this.visitNode(child, mml);
        }
        parent.appendChild(mml);
    }
    addAttributes(node, mml) {
        const attributes = this.getAttributeList(node);
        for (const name of Object.keys(attributes)) {
            mml.setAttribute(name, attributes[name].toString());
        }
    }
}
//# sourceMappingURL=MathMLVisitor.js.map