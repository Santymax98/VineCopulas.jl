import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMtr, CommonMtrClass, CommonMlabeledtr, CommonMlabeledtrClass } from '../../common/Wrappers/mtr.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { SvgMtdNTD } from './mtd.js';
export type SizeData = {
    x: number;
    y: number;
    w: number;
    lSpace: number;
    rSpace: number;
    lLine: number;
    rLine: number;
};
export interface SvgMtrNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMtr<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    H: number;
    D: number;
    tSpace: number;
    bSpace: number;
    tLine: number;
    bLine: number;
    placeCell(cell: SvgMtdNTD<N, T, D>, sizes: SizeData): number;
}
export interface SvgMtrClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMtrClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMtrNTD<N, T, D>;
}
export declare const SvgMtr: SvgMtrClass<any, any, any>;
export interface SvgMlabeledtrNTD<N, T, D> extends SvgMtrNTD<N, T, D>, CommonMlabeledtr<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgMlabeledtrClass<N, T, D> extends SvgMtrClass<N, T, D>, CommonMlabeledtrClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMlabeledtrNTD<N, T, D>;
}
export declare const SvgMlabeledtr: SvgMlabeledtrClass<any, any, any>;
