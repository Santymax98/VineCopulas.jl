import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMenclose, CommonMencloseClass } from '../../common/Wrappers/menclose.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { SvgMsqrtNTD } from './msqrt.js';
export interface SvgMencloseNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMenclose<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass, SvgMsqrtNTD<N, T, D>> {
    line(pq: [number, number, number, number]): N;
    box(w: number, h: number, d: number, r?: number): N;
    ellipse(w: number, h: number, d: number): N;
    path(join: string, ...P: (string | number)[]): N;
    fill(...P: (string | number)[]): N;
}
export interface SvgMencloseClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMencloseClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMencloseNTD<N, T, D>;
}
export declare const SvgMenclose: SvgMencloseClass<any, any, any>;
