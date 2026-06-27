import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMpadded, CommonMpaddedClass } from '../../common/Wrappers/mpadded.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMpaddedNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMpadded<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMpaddedClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMpaddedClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMpaddedNTD<N, T, D>;
}
export declare const SvgMpadded: SvgMpaddedClass<any, any, any>;
