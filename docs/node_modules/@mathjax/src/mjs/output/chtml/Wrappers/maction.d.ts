import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonMaction, CommonMactionClass } from '../../common/Wrappers/maction.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { EventHandler } from '../../common/Wrappers/maction.js';
export interface ChtmlMactionNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMaction<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    setEventHandler(type: string, handler: EventHandler, dom?: N): void;
    Em(m: number): string;
}
export interface ChtmlMactionClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMactionClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMactionNTD<N, T, D>;
}
export declare const ChtmlMaction: ChtmlMactionClass<any, any, any>;
