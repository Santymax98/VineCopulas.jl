import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMtd, CommonMtdClass } from '../../common/Wrappers/mtd.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMtdNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMtd<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    placeCell(x: number, y: number, W: number, H: number, D: number): [number, number];
    placeColor(x: number, y: number, W: number, H: number): void;
}
export interface SvgMtdClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMtdClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMtdNTD<N, T, D>;
}
export declare const SvgMtd: SvgMtdClass<any, any, any>;
