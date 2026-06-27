import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMphantomNTD<N, T, D> extends SvgWrapper<N, T, D> {
}
export interface SvgMphantomClass<N, T, D> extends SvgWrapperClass<N, T, D> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMphantomNTD<N, T, D>;
}
export declare const SvgMphantom: SvgMphantomClass<any, any, any>;
