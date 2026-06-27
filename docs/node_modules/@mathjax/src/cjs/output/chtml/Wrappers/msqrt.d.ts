import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMsqrt, CommonMsqrtClass } from '../../common/Wrappers/msqrt.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMsqrtNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMsqrt<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMsqrtClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMsqrtClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMsqrtNTD<N, T, D>;
}
export declare const ChtmlMsqrt: ChtmlMsqrtClass<any, any, any>;
