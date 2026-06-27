import { MmlVisitor } from './MmlVisitor.js';
import { toEntity } from '../../util/string.js';
export class SerializedMmlVisitor extends MmlVisitor {
    visitTree(node) {
        return this.visitNode(node, '');
    }
    visitTextNode(node, _space) {
        return this.quoteHTML(node.getText());
    }
    visitXMLNode(node, space) {
        return space + node.getSerializedXML();
    }
    visitHtmlNode(node, _space) {
        return node.getSerializedHTML();
    }
    visitInferredMrowNode(node, space) {
        const mml = [];
        for (const child of node.childNodes) {
            mml.push(this.visitNode(child, space));
        }
        return mml.join('\n');
    }
    visitAnnotationNode(node, space) {
        const children = this.childNodeMml(node, '', '');
        return `${space}<annotation${this.getAttributes(node)}>${children}</annotation>`;
    }
    visitDefault(node, space) {
        const kind = this.getKind(node);
        const [nl, endspace] = node.isToken || node.childNodes.length === 0 ? ['', ''] : ['\n', space];
        const children = this.childNodeMml(node, space + '  ', nl);
        const childNode = children.match(/\S/) ? nl + children + endspace : '';
        return `${space}<${kind}${this.getAttributes(node)}>${childNode}</${kind}>`;
    }
    childNodeMml(node, space, nl) {
        let mml = '';
        for (const child of node.childNodes) {
            mml += this.visitNode(child, space) + nl;
        }
        return mml;
    }
    getAttributes(node) {
        const attr = [];
        const attributes = this.getAttributeList(node);
        for (const name of Object.keys(attributes)) {
            const value = String(attributes[name]);
            if (value === undefined)
                continue;
            attr.push(name + '="' + this.quoteHTML(value) + '"');
        }
        return attr.length ? ' ' + attr.join(' ') : '';
    }
    quoteHTML(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/[\uD800-\uDBFF]./g, this.toEntity)
            .replace(/[\u0080-\uD7FF\uE000-\uFFFF]/g, this.toEntity);
    }
    toEntity(c) {
        return toEntity(c);
    }
}
//# sourceMappingURL=SerializedMmlVisitor.js.map