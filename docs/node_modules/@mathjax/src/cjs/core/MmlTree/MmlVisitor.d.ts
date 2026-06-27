import { MmlNode, TextNode, XMLNode } from './MmlNode.js';
import { HtmlNode } from './MmlNodes/HtmlNode.js';
import { MmlFactory } from './MmlFactory.js';
import { AbstractVisitor } from '../Tree/Visitor.js';
import { PropertyList } from '../Tree/Node.js';
export declare const DATAMJX = "data-mjx-";
export declare class MmlVisitor extends AbstractVisitor<MmlNode> {
    static rename: PropertyList;
    static variants: PropertyList;
    static defaultAttributes: {
        [kind: string]: PropertyList;
    };
    constructor(factory?: MmlFactory);
    visitTextNode(_node: TextNode, ..._args: any[]): any;
    visitXMLNode(_node: XMLNode, ..._args: any[]): any;
    visitHtmlNode(_node: HtmlNode<any>, ..._args: any[]): any;
    protected getKind(node: MmlNode): string;
    protected getAttributeList(node: MmlNode): PropertyList;
    protected getDataAttributes(node: MmlNode): PropertyList;
    protected setDataAttribute(data: PropertyList, name: string, value: string): void;
}
