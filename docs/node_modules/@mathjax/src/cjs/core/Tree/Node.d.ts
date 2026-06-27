import { NodeFactory } from './NodeFactory.js';
export type Property = string | number | boolean;
export type PropertyList = {
    [key: string]: Property;
};
export interface Node<N extends Node<N, C>, C extends NodeClass<N, C>> {
    readonly kind: string;
    readonly factory: NodeFactory<N, C>;
    parent: N;
    childNodes: N[];
    setProperty(name: string, value: Property): void;
    getProperty(name: string): Property;
    getPropertyNames(): string[];
    getAllProperties(): PropertyList;
    removeProperty(...names: string[]): void;
    isKind(kind: string): boolean;
    setChildren(children: N[]): void;
    appendChild(child: N): N;
    replaceChild(newChild: N, oldChild: N): N;
    removeChild(child: N): N;
    childIndex(child: N): number;
    copy(): N;
    findNodes(kind: string): N[];
    walkTree(func: (node: N, data?: any) => void, data?: any): void;
}
export interface NodeClass<N extends Node<N, C>, C extends NodeClass<N, C>> {
    new (factory: NodeFactory<N, C>, properties?: PropertyList, children?: N[]): N;
}
export declare abstract class AbstractNode<N extends Node<N, C>, C extends NodeClass<N, C>> implements Node<N, C> {
    readonly factory: NodeFactory<N, C>;
    parent: N;
    protected properties: PropertyList;
    childNodes: N[];
    constructor(factory: NodeFactory<N, C>, properties?: PropertyList, children?: N[]);
    get kind(): string;
    setProperty(name: string, value: Property): void;
    getProperty(name: string): Property;
    getPropertyNames(): string[];
    getAllProperties(): PropertyList;
    removeProperty(...names: string[]): void;
    isKind(kind: string): boolean;
    setChildren(children: N[]): void;
    appendChild(child: N): N;
    replaceChild(newChild: N, oldChild: N): N;
    removeChild(child: N): N;
    childIndex(node: N): number;
    copy(): N;
    findNodes(kind: string): N[];
    walkTree(func: (node: N, data?: any) => void, data?: any): any;
    toString(): string;
}
export declare abstract class AbstractEmptyNode<N extends Node<N, C>, C extends NodeClass<N, C>> extends AbstractNode<N, C> {
    setChildren(_children: N[]): void;
    appendChild(child: N): N;
    replaceChild(_newChild: N, oldChild: N): N;
    childIndex(_node: N): number;
    walkTree(func: (node: N, data?: any) => void, data?: any): any;
    toString(): string;
}
