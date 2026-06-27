import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMspace, CommonMspaceClass } from '../../common/Wrappers/mspace.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMspaceNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMspace<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMspaceClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMspaceClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMspaceNTD<N, T, D>;
}
export declare const SvgMspace: SvgMspaceClass<any, any, any>;
