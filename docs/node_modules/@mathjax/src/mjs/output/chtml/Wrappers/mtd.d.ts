import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMtd, CommonMtdClass } from '../../common/Wrappers/mtd.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlMtdNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMtd<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMtdClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMtdClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMtdNTD<N, T, D>;
}
export declare const ChtmlMtd: ChtmlMtdClass<any, any, any>;
