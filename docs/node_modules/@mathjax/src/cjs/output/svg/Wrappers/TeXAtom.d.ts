import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonTeXAtom, CommonTeXAtomClass } from '../../common/Wrappers/TeXAtom.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgTeXAtomNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonTeXAtom<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgTeXAtomClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonTeXAtomClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgTeXAtomNTD<N, T, D>;
}
export declare const SvgTeXAtom: SvgTeXAtomClass<any, any, any>;
