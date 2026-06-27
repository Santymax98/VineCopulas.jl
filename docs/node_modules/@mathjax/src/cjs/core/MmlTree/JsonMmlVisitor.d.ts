import { PropertyList } from '../Tree/Node.js';
import { MmlVisitor } from './MmlVisitor.js';
import { MmlNode, TextNode, XMLNode } from './MmlNode.js';
export type MmlNodeJSON = {
    kind: string;
    texClass: number;
    isEmbellished?: boolean;
    isSpacelike?: boolean;
    isInferred?: boolean;
    childNodes: MmlJSON[];
    attributes: PropertyList;
    inherited: PropertyList;
    properties: PropertyList;
};
export type MmlTextJSON = {
    kind: string;
    text: string;
};
export type MmlXmlJSON = {
    kind: string;
    xml: any;
};
export type MmlJSON = MmlNodeJSON | MmlTextJSON | MmlXmlJSON;
export declare class JsonMmlVisitor extends MmlVisitor {
    visitTree(node: MmlNode): MmlJSON;
    visitTextNode(node: TextNode): MmlTextJSON;
    visitXMLNode(node: XMLNode): MmlXmlJSON;
    visitDefault(node: MmlNode): MmlJSON;
    getChildren(node: MmlNode): MmlJSON[];
    getAttributes(node: MmlNode): PropertyList;
    getInherited(node: MmlNode): PropertyList;
    getProperties(node: MmlNode): PropertyList;
}
