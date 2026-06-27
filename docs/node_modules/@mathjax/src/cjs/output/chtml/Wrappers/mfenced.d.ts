import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMfenced, CommonMfencedClass } from '../../common/Wrappers/mfenced.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMfencedNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMfenced<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMfencedClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMfencedClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMfencedNTD<N, T, D>;
}
export declare const ChtmlMfenced: ChtmlMfencedClass<any, any, any>;
