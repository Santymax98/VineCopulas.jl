import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMmultiscripts, CommonMmultiscriptsClass } from '../../common/Wrappers/mmultiscripts.js';
import { ChtmlMsubsupClass, ChtmlMsubsupNTD } from './msubsup.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMmultiscriptsNTD<N, T, D> extends ChtmlMsubsupNTD<N, T, D>, CommonMmultiscripts<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMmultiscriptsClass<N, T, D> extends ChtmlMsubsupClass<N, T, D>, CommonMmultiscriptsClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMmultiscriptsNTD<N, T, D>;
}
export declare const ChtmlMmultiscripts: ChtmlMmultiscriptsClass<any, any, any>;
