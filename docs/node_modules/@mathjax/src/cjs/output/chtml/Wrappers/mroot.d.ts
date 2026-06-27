import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMroot, CommonMrootClass } from '../../common/Wrappers/mroot.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { ChtmlMsqrtClass, ChtmlMsqrtNTD } from './msqrt.js';
export interface ChtmlMrootNTD<N, T, D> extends ChtmlMsqrtNTD<N, T, D>, CommonMroot<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlMrootClass<N, T, D> extends ChtmlMsqrtClass<N, T, D>, CommonMrootClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMrootNTD<N, T, D>;
}
export declare const ChtmlMroot: ChtmlMrootClass<any, any, any>;
