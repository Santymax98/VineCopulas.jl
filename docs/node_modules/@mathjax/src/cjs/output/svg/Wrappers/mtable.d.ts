import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMtable, CommonMtableClass } from '../../common/Wrappers/mtable.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { SvgMtrNTD } from './mtr.js';
export interface SvgMtableNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMtable<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass, SvgMtrNTD<N, T, D>> {
    labels: N;
}
export interface SvgMtableClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMtableClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMtableNTD<N, T, D>;
}
export declare const SvgMtable: SvgMtableClass<any, any, any>;
