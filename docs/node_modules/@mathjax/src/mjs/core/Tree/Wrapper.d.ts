import { Node, NodeClass } from './Node.js';
import { WrapperFactory } from './WrapperFactory.js';
export interface Wrapper<N extends Node<N, C>, C extends NodeClass<N, C>, W extends Wrapper<N, C, W>> {
    readonly kind: string;
    node: N;
    childNodes: W[];
    wrap<T extends W = W>(node: N, ...args: any[]): T;
    walkTree(func: (node: W, data?: any) => void, data?: any): void;
}
export interface WrapperClass<N extends Node<N, C>, C extends NodeClass<N, C>, W extends Wrapper<N, C, W>> {
    new (factory: WrapperFactory<N, C, W, WrapperClass<N, C, W>>, node: N, ...args: any[]): W;
}
export declare class AbstractWrapper<N extends Node<N, C>, C extends NodeClass<N, C>, W extends Wrapper<N, C, W>> implements Wrapper<N, C, W> {
    node: N;
    childNodes: W[];
    protected factory: WrapperFactory<N, C, W, WrapperClass<N, C, W>>;
    get kind(): string;
    constructor(factory: WrapperFactory<N, C, W, WrapperClass<N, C, W>>, node: N);
    wrap<T extends W = W>(node: N): T;
    walkTree(func: (node: W, data?: any) => void, data?: any): any;
}
