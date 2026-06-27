import { ChtmlWrapper } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlXmlNodeNTD, ChtmlXmlNodeClass } from './semantics.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlHtmlNodeNTD<N, T, D> extends ChtmlXmlNodeNTD<N, T, D> {
}
export interface ChtmlHtmlNodeClass<N, T, D> extends ChtmlXmlNodeClass<N, T, D> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlHtmlNodeNTD<N, T, D>;
}
export declare const ChtmlHtmlNode: ChtmlHtmlNodeClass<any, any, any>;
