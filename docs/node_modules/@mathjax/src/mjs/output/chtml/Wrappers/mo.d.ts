import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CharDataArray } from '../../common/FontData.js';
import { CommonMo, CommonMoClass } from '../../common/Wrappers/mo.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMoNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMo<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMoClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMoClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMoNTD<N, T, D>;
}
export type PartData = CharDataArray<ChtmlCharOptions>;
export declare const ChtmlMo: ChtmlMoClass<any, any, any>;
