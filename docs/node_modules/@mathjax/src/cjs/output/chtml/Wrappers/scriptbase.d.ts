import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonScriptbase, CommonScriptbaseClass } from '../../common/Wrappers/scriptbase.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { BBox } from '../../../util/BBox.js';
export interface ChtmlScriptbaseNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonScriptbase<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    setDeltaW(nodes: N[], dx: number[]): void;
    adjustOverDepth(over: N, overbox: BBox): void;
    adjustUnderDepth(under: N, underbox: BBox): void;
    adjustBaseHeight(base: N, basebox: BBox): void;
}
export interface ChtmlScriptbaseClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonScriptbaseClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlScriptbaseNTD<N, T, D>;
}
export declare const ChtmlScriptbase: ChtmlScriptbaseClass<any, any, any>;
