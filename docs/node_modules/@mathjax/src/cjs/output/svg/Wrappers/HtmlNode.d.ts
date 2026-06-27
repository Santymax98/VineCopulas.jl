import { SvgWrapper } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgXmlNodeNTD, SvgXmlNodeClass } from './semantics.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgHtmlNodeNTD<N, T, D> extends SvgXmlNodeNTD<N, T, D> {
}
export interface SvgHtmlNodeClass<N, T, D> extends SvgXmlNodeClass<N, T, D> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgHtmlNodeNTD<N, T, D>;
}
export declare const SvgHtmlNode: SvgHtmlNodeClass<any, any, any>;
