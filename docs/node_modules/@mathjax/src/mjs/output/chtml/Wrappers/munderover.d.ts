import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMunder, CommonMunderClass, CommonMover, CommonMoverClass, CommonMunderover, CommonMunderoverClass } from '../../common/Wrappers/munderover.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { ChtmlMsubClass, ChtmlMsubNTD, ChtmlMsupClass, ChtmlMsupNTD, ChtmlMsubsupClass, ChtmlMsubsupNTD } from './msubsup.js';
export interface ChtmlMunderNTD<N, T, D> extends ChtmlMsubNTD<N, T, D>, CommonMunder<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMunderClass<N, T, D> extends ChtmlMsubClass<N, T, D>, CommonMunderClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMunderNTD<N, T, D>;
}
export declare const ChtmlMunder: ChtmlMunderClass<any, any, any>;
export interface ChtmlMoverNTD<N, T, D> extends ChtmlMsupNTD<N, T, D>, CommonMover<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMoverClass<N, T, D> extends ChtmlMsupClass<N, T, D>, CommonMoverClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMoverNTD<N, T, D>;
}
export declare const ChtmlMover: ChtmlMoverClass<any, any, any>;
export interface ChtmlMunderoverNTD<N, T, D> extends ChtmlMsubsupNTD<N, T, D>, CommonMunderover<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMunderoverClass<N, T, D> extends ChtmlMsubsupClass<N, T, D>, CommonMunderoverClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMunderoverNTD<N, T, D>;
}
export declare const ChtmlMunderover: ChtmlMunderoverClass<any, any, any>;
