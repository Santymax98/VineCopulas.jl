import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonSemantics, CommonSemanticsClass } from '../../common/Wrappers/semantics.js';
import { CommonXmlNode, CommonXmlNodeClass } from '../../common/Wrappers/XmlNode.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgSemanticsNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonSemantics<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgSemanticsClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonSemanticsClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgSemanticsNTD<N, T, D>;
}
export declare const SvgSemantics: SvgSemanticsClass<any, any, any>;
export declare const SvgAnnotation: SvgWrapperClass<any, any, any>;
export declare const SvgAnnotationXML: SvgWrapperClass<any, any, any>;
export interface SvgXmlNodeNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonXmlNode<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgXmlNodeClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonXmlNodeClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgXmlNodeNTD<N, T, D>;
}
export declare const SvgXmlNode: SvgXmlNodeClass<any, any, any>;
