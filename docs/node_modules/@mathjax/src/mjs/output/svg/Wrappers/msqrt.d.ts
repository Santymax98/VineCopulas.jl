import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMsqrt, CommonMsqrtClass } from '../../common/Wrappers/msqrt.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMsqrtNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMsqrt<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    dx: number;
}
export interface SvgMsqrtClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMsqrtClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMsqrtNTD<N, T, D>;
}
export declare const SvgMsqrt: SvgMsqrtClass<any, any, any>;
