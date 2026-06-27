import { SVG } from '../svg.js';
import { CommonWrapperFactory } from '../common/WrapperFactory.js';
import { SvgWrapper, SvgWrapperClass } from './Wrapper.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from './FontData.js';
export declare class SvgWrapperFactory<N, T, D> extends CommonWrapperFactory<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    static defaultNodes: {
        [kind: string]: SvgWrapperClass<any, any, any>;
    };
}
