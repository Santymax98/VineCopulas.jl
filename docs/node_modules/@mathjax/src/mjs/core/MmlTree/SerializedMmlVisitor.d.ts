import { MmlVisitor } from './MmlVisitor.js';
import { MmlNode, TextNode, XMLNode } from './MmlNode.js';
import { HtmlNode } from './MmlNodes/HtmlNode.js';
export declare class SerializedMmlVisitor extends MmlVisitor {
    visitTree(node: MmlNode): string;
    visitTextNode(node: TextNode, _space: string): string;
    visitXMLNode(node: XMLNode, space: string): string;
    visitHtmlNode(node: HtmlNode<any>, _space: string): string;
    visitInferredMrowNode(node: MmlNode, space: string): string;
    visitAnnotationNode(node: MmlNode, space: string): string;
    visitDefault(node: MmlNode, space: string): string;
    protected childNodeMml(node: MmlNode, space: string, nl: string): string;
    protected getAttributes(node: MmlNode): string;
    protected quoteHTML(value: string): string;
    protected toEntity(c: string): string;
}
