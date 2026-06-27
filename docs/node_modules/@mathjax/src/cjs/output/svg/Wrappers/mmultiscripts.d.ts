import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMmultiscripts, CommonMmultiscriptsClass } from '../../common/Wrappers/mmultiscripts.js';
import { SvgMsubsupNTD, SvgMsubsupClass } from './msubsup.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export type AlignFunction = (w: number, W: number) => number;
export declare function AlignX(align: string): AlignFunction;
export interface SvgMmultiscriptsNTD<N, T, D> extends SvgMsubsupNTD<N, T, D>, CommonMmultiscripts<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMmultiscriptsClass<N, T, D> extends SvgMsubsupClass<N, T, D>, CommonMmultiscriptsClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMmultiscriptsNTD<N, T, D>;
}
export declare const SvgMmultiscripts: SvgMmultiscriptsClass<any, any, any>;
