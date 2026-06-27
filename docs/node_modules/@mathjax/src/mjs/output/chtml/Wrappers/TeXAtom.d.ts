import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonTeXAtom, CommonTeXAtomClass } from '../../common/Wrappers/TeXAtom.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlTeXAtomNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonTeXAtom<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlTeXAtomClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonTeXAtomClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlTeXAtomNTD<N, T, D>;
}
export declare const ChtmlTeXAtom: ChtmlTeXAtomClass<any, any, any>;
