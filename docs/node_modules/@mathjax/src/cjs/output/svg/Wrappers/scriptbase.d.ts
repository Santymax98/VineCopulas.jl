import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonScriptbase, CommonScriptbaseClass } from '../../common/Wrappers/scriptbase.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgScriptbaseNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonScriptbase<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgScriptbaseClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonScriptbaseClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgScriptbaseNTD<N, T, D>;
}
export declare const SvgScriptbase: SvgScriptbaseClass<any, any, any>;
