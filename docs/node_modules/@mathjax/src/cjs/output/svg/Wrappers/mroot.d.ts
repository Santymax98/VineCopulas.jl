import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMroot, CommonMrootClass } from '../../common/Wrappers/mroot.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { SvgMsqrtClass, SvgMsqrtNTD } from './msqrt.js';
export interface SvgMrootNTD<N, T, D> extends SvgMsqrtNTD<N, T, D>, CommonMroot<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMrootClass<N, T, D> extends SvgMsqrtClass<N, T, D>, CommonMrootClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMrootNTD<N, T, D>;
}
export declare const SvgMroot: SvgMrootClass<any, any, any>;
