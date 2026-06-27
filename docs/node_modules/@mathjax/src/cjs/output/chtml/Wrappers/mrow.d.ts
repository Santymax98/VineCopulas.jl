import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMrow, CommonMrowClass } from '../../common/Wrappers/mrow.js';
import { CommonInferredMrow, CommonInferredMrowClass } from '../../common/Wrappers/mrow.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMrowNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMrow<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMrowClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMrowClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMrowNTD<N, T, D>;
}
export declare const ChtmlMrow: ChtmlMrowClass<any, any, any>;
export interface ChtmlInferredMrowNTD<N, T, D> extends ChtmlMrowNTD<N, T, D>, CommonInferredMrow<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlInferredMrowClass<N, T, D> extends ChtmlMrowClass<N, T, D>, CommonInferredMrowClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlInferredMrowNTD<N, T, D>;
}
export declare const ChtmlInferredMrow: ChtmlInferredMrowClass<any, any, any>;
