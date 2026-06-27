import { MmlVisitor } from './MmlVisitor.js';
export class JsonMmlVisitor extends MmlVisitor {
    visitTree(node) {
        return this.visitNode(node);
    }
    visitTextNode(node) {
        return { kind: node.kind, text: node.getText() };
    }
    visitXMLNode(node) {
        return { kind: node.kind, xml: node.getXML() };
    }
    visitDefault(node) {
        const json = {
            kind: node.kind.replace(/inferredM/, 'm'),
            texClass: node.texClass,
            attributes: this.getAttributes(node),
            inherited: this.getInherited(node),
            properties: this.getProperties(node),
            childNodes: this.getChildren(node),
        };
        if (node.isInferred) {
            json.isInferred = true;
        }
        if (node.isEmbellished) {
            json.isEmbellished = true;
        }
        if (node.isSpacelike) {
            json.isSpacelike = true;
        }
        return json;
    }
    getChildren(node) {
        const children = [];
        for (const child of node.childNodes) {
            children.push(this.visitNode(child));
        }
        return children;
    }
    getAttributes(node) {
        return Object.assign({}, node.attributes.getAllAttributes());
    }
    getInherited(node) {
        return Object.assign({}, node.attributes.getAllInherited());
    }
    getProperties(node) {
        return Object.assign({}, node.getAllProperties());
    }
}
//# sourceMappingURL=JsonMmlVisitor.js.map