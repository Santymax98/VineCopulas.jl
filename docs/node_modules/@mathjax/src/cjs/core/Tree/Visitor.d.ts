import { Factory, FactoryNode, FactoryNodeClass } from './Factory.js';
export interface VisitorNode<N extends VisitorNode<N>> extends FactoryNode {
    childNodes?: N[];
}
export type VisitorFunction<N extends VisitorNode<N>> = (visitor: Factory<N, FactoryNodeClass<N>>, node: N, ...args: any[]) => any;
export interface Visitor<N extends VisitorNode<N>> {
    visitTree(tree: N, ...args: any[]): any;
    visitNode(node: N, ...args: any[]): any;
    visitDefault(node: N, ...args: any[]): any;
    setNodeHandler(kind: string, handler: VisitorFunction<N>): void;
    removeNodeHandler(kind: string): void;
    [property: string]: any;
}
export declare abstract class AbstractVisitor<N extends VisitorNode<N>> implements Visitor<N> {
    protected nodeHandlers: Map<string, VisitorFunction<N>>;
    protected static methodName(kind: string): string;
    constructor(factory: Factory<N, FactoryNodeClass<N>>);
    visitTree(tree: N, ...args: any[]): any;
    visitNode(node: N, ...args: any[]): any;
    visitDefault(node: N, ...args: any[]): void;
    setNodeHandler(kind: string, handler: VisitorFunction<N>): void;
    removeNodeHandler(kind: string): void;
}
