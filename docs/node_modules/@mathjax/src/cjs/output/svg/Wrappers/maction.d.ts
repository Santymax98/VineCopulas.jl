import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonMaction, CommonMactionClass } from '../../common/Wrappers/maction.js';
import { EventHandler } from '../../common/Wrappers/maction.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgMactionNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMaction<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    setEventHandler(type: string, handler: EventHandler, dom?: N): void;
    Px(m: number): string;
}
export interface SvgMactionClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMactionClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMactionNTD<N, T, D>;
}
export declare const SvgMaction: SvgMactionClass<any, any, any>;
