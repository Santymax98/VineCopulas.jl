import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMtr, CommonMtrClass, CommonMlabeledtr, CommonMlabeledtrClass } from '../../common/Wrappers/mtr.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMtrNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMtr<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMtrClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMtrClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMtrNTD<N, T, D>;
}
export declare const ChtmlMtr: ChtmlMtrClass<any, any, any>;
export interface ChtmlMlabeledtrNTD<N, T, D> extends ChtmlMtrNTD<N, T, D>, CommonMlabeledtr<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMlabeledtrClass<N, T, D> extends ChtmlMtrClass<N, T, D>, CommonMlabeledtrClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMlabeledtrNTD<N, T, D>;
}
export declare const ChtmlMlabeledtr: ChtmlMlabeledtrClass<any, any, any>;
