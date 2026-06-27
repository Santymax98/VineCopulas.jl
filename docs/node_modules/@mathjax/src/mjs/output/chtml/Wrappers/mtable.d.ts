import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMtable, CommonMtableClass } from '../../common/Wrappers/mtable.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { ChtmlMtrNTD } from './mtr.js';
export interface ChtmlMtableNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMtable<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass, ChtmlMtrNTD<N, T, D>> {
    labels: N;
    itable: N;
}
export interface ChtmlMtableClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMtableClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMtableNTD<N, T, D>;
}
export declare const ChtmlMtable: ChtmlMtableClass<any, any, any>;
