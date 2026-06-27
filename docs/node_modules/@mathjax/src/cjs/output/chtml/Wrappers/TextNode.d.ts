import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonTextNode, CommonTextNodeClass } from '../../common/Wrappers/TextNode.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlTextNodeNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonTextNode<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlTextNodeClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonTextNodeClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlTextNodeNTD<N, T, D>;
}
export declare const ChtmlTextNode: ChtmlTextNodeClass<any, any, any>;
