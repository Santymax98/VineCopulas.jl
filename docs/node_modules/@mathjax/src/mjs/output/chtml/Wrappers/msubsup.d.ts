import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMsub, CommonMsubClass, CommonMsup, CommonMsupClass, CommonMsubsup, CommonMsubsupClass } from '../../common/Wrappers/msubsup.js';
import { ChtmlScriptbaseClass, ChtmlScriptbaseNTD } from './scriptbase.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMsubNTD<N, T, D> extends ChtmlScriptbaseNTD<N, T, D>, CommonMsub<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMsubClass<N, T, D> extends ChtmlScriptbaseClass<N, T, D>, CommonMsubClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMsubNTD<N, T, D>;
}
export declare const ChtmlMsub: ChtmlMsubClass<any, any, any>;
export interface ChtmlMsupNTD<N, T, D> extends ChtmlScriptbaseNTD<N, T, D>, CommonMsup<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMsupClass<N, T, D> extends ChtmlScriptbaseClass<N, T, D>, CommonMsupClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMsupNTD<N, T, D>;
}
export declare const ChtmlMsup: ChtmlMsupClass<any, any, any>;
export interface ChtmlMsubsupNTD<N, T, D> extends ChtmlScriptbaseNTD<N, T, D>, CommonMsubsup<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMsubsupClass<N, T, D> extends ChtmlScriptbaseClass<N, T, D>, CommonMsubsupClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMsubsupNTD<N, T, D>;
}
export declare const ChtmlMsubsup: ChtmlMsubsupClass<any, any, any>;
