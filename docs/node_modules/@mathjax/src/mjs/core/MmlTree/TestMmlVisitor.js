import { SerializedMmlVisitor } from './SerializedMmlVisitor.js';
export class TestMmlVisitor extends SerializedMmlVisitor {
    visitDefault(node, space) {
        const kind = node.kind;
        const [nl, endspace] = node.isToken || node.childNodes.length === 0 ? ['', ''] : ['\n', space];
        const attributes = this.attributeString({
            isEmbellished: node.isEmbellished,
            isSpacelike: node.isSpacelike,
            texClass: node.texClass,
        }, '{', '}');
        let mml = `${space}<${kind}${this.getAttributes(node)}${this.getInherited(node)}${this.getProperties(node)}\n` +
            `${space}   ${attributes}>${nl}`;
        space += '  ';
        for (const child of node.childNodes) {
            mml += this.visitNode(child, space) + nl;
        }
        mml += `${endspace}</${kind}>`;
        return mml;
    }
    getAttributes(node) {
        return this.attributeString(node.attributes.getAllAttributes(), '', '');
    }
    getInherited(node) {
        return this.attributeString(node.attributes.getAllInherited(), '[', ']');
    }
    getProperties(node) {
        return this.attributeString(node.getAllProperties(), '[[', ']]');
    }
    attributeString(attributes, open, close) {
        let ATTR = '';
        for (const name of Object.keys(attributes)) {
            ATTR += ` ${open}${name}="${this.quoteHTML(String(attributes[name]))}"${close}`;
        }
        return ATTR;
    }
}
//# sourceMappingURL=TestMmlVisitor.js.map