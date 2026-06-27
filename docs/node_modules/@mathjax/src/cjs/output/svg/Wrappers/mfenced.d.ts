import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMfenced, CommonMfencedClass } from '../../common/Wrappers/mfenced.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMfencedNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMfenced<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMfencedClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMfencedClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMfencedNTD<N, T, D>;
}
export declare const SvgMfenced: SvgMfencedClass<any, any, any>;
