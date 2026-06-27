import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMglyph, CommonMglyphClass } from '../../common/Wrappers/mglyph.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMglyphNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMglyph<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMglyphClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMglyphClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMglyphNTD<N, T, D>;
}
export declare const SvgMglyph: SvgMglyphClass<any, any, any>;
