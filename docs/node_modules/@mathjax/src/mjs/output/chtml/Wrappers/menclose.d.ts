import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMenclose, CommonMencloseClass } from '../../common/Wrappers/menclose.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { ChtmlMsqrtNTD } from './msqrt.js';
export interface ChtmlMencloseNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMenclose<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass, ChtmlMsqrtNTD<N, T, D>> {
    adjustBorder(node: N): N;
    adjustThickness(shape: N): N;
    fixed(m: number, n?: number): string;
    Em(m: number): string;
}
export interface ChtmlMencloseClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMencloseClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMencloseNTD<N, T, D>;
}
export declare const ChtmlMenclose: ChtmlMencloseClass<any, any, any>;
