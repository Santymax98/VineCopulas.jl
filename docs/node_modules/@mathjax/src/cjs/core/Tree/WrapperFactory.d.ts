import { Node, NodeClass } from './Node.js';
import { Wrapper, WrapperClass } from './Wrapper.js';
import { Factory, AbstractFactory } from './Factory.js';
export interface WrapperFactory<N extends Node<N, C>, C extends NodeClass<N, C>, WW extends Wrapper<N, C, WW>, WC extends WrapperClass<N, C, WW>> extends Factory<WW, WC> {
    wrap<TT extends WW = WW>(node: N, ...args: any[]): TT;
}
export declare abstract class AbstractWrapperFactory<N extends Node<N, C>, C extends NodeClass<N, C>, WW extends Wrapper<N, C, WW>, WC extends WrapperClass<N, C, WW>> extends AbstractFactory<WW, WC> implements WrapperFactory<N, C, WW, WC> {
    wrap<TT extends WW = WW>(node: N, ...args: any[]): TT;
}
