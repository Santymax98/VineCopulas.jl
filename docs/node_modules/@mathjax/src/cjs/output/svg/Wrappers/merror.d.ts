import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMerrorNTD<N, T, D> extends SvgWrapper<N, T, D> {
}
export interface SvgMerrorClass<N, T, D> extends SvgWrapperClass<N, T, D> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMerrorNTD<N, T, D>;
}
export declare const SvgMerror: SvgMerrorClass<any, any, any>;
