import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMrow, CommonMrowClass, CommonInferredMrow, CommonInferredMrowClass } from '../../common/Wrappers/mrow.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMrowNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMrow<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMrowClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMrowClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMrowNTD<N, T, D>;
}
export declare const SvgMrow: SvgMrowClass<any, any, any>;
export interface SvgInferredMrowNTD<N, T, D> extends SvgMrowNTD<N, T, D>, CommonInferredMrow<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgInferredMrowClass<N, T, D> extends SvgMrowClass<N, T, D>, CommonInferredMrowClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapper<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgInferredMrowNTD<N, T, D>;
}
export declare const SvgInferredMrow: SvgInferredMrowClass<any, any, any>;
