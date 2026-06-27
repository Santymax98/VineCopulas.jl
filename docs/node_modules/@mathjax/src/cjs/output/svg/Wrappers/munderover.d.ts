import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { SvgMsubClass, SvgMsubNTD, SvgMsupClass, SvgMsupNTD, SvgMsubsupClass, SvgMsubsupNTD } from './msubsup.js';
import { CommonMunder, CommonMunderClass, CommonMover, CommonMoverClass, CommonMunderover, CommonMunderoverClass } from '../../common/Wrappers/munderover.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMunderNTD<N, T, D> extends SvgMsubNTD<N, T, D>, CommonMunder<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMunderClass<N, T, D> extends SvgMsubClass<N, T, D>, CommonMunderClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMunderNTD<N, T, D>;
}
export declare const SvgMunder: SvgMunderClass<any, any, any>;
export interface SvgMoverNTD<N, T, D> extends SvgMsupNTD<N, T, D>, CommonMover<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMoverClass<N, T, D> extends SvgMsupClass<N, T, D>, CommonMoverClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMoverNTD<N, T, D>;
}
export declare const SvgMover: SvgMoverClass<any, any, any>;
export interface SvgMunderoverNTD<N, T, D> extends SvgMsubsupNTD<N, T, D>, CommonMunderover<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMunderoverClass<N, T, D> extends SvgMsubsupClass<N, T, D>, CommonMunderoverClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMunderoverNTD<N, T, D>;
}
export declare const SvgMunderover: SvgMunderoverClass<any, any, any>;
