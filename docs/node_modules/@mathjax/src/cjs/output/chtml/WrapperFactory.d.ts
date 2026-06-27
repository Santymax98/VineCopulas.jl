import { CHTML } from '../chtml.js';
import { CommonWrapperFactory } from '../common/WrapperFactory.js';
import { ChtmlWrapper, ChtmlWrapperClass } from './Wrapper.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from './FontData.js';
export declare class ChtmlWrapperFactory<N, T, D> extends CommonWrapperFactory<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    static defaultNodes: {
        [kind: string]: ChtmlWrapperClass<any, any, any>;
    };
}
