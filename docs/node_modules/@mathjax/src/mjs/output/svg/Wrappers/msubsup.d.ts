import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMsub, CommonMsubClass, CommonMsup, CommonMsupClass, CommonMsubsup, CommonMsubsupClass } from '../../common/Wrappers/msubsup.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { SvgScriptbaseNTD, SvgScriptbaseClass } from './scriptbase.js';
export interface SvgMsubNTD<N, T, D> extends SvgScriptbaseNTD<N, T, D>, CommonMsub<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMsubClass<N, T, D> extends SvgScriptbaseClass<N, T, D>, CommonMsubClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMsubNTD<N, T, D>;
}
export declare const SvgMsub: SvgMsubClass<any, any, any>;
export interface SvgMsupNTD<N, T, D> extends SvgScriptbaseNTD<N, T, D>, CommonMsup<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMsupClass<N, T, D> extends SvgScriptbaseClass<N, T, D>, CommonMsupClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMsupNTD<N, T, D>;
}
export declare const SvgMsup: SvgMsupClass<any, any, any>;
export interface SvgMsubsupNTD<N, T, D> extends SvgScriptbaseNTD<N, T, D>, CommonMsubsup<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMsubsupClass<N, T, D> extends SvgScriptbaseClass<N, T, D>, CommonMsubsupClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMsubsupNTD<N, T, D>;
}
export declare const SvgMsubsup: SvgMsubsupClass<any, any, any>;
