import { OptionList } from '../../util/Options.js';
import { CommonWrapper, CommonWrapperClass, Constructor, StringMap } from '../common/Wrapper.js';
import { CHTML } from '../chtml.js';
import { ChtmlWrapperFactory } from './WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from './FontData.js';
export { Constructor, StringMap } from '../common/Wrapper.js';
export declare const FONTSIZE: StringMap;
export type ChtmlConstructor<N, T, D> = Constructor<ChtmlWrapper<N, T, D>>;
export interface ChtmlWrapperClass<N, T, D> extends CommonWrapperClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    autoStyle: boolean;
}
export declare class ChtmlWrapper<N, T, D> extends CommonWrapper<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    static kind: string;
    static autoStyle: boolean;
    toCHTML(parents: N[]): void;
    toEmbellishedCHTML(parents: N[]): boolean;
    addChildren(parents: N[]): void;
    protected standardChtmlNodes(parents: N[]): N[];
    markUsed(): void;
    protected createChtmlNodes(parents: N[]): N[];
    protected handleHref(parents: N[]): N[];
    protected handleStyles(): void;
    protected handleScale(): void;
    protected setScale(chtml: N, rscale: number): N;
    protected handleSpace(): void;
    protected handleBorders(): void;
    protected handleColor(): void;
    protected handleAttributes(): void;
    protected handlePWidth(): void;
    protected setIndent(chtml: N, align: string, shift: number): void;
    drawBBox(): void;
    html(type: string, def?: OptionList, content?: (N | T)[]): N;
    text(text: string): T;
    protected char(n: number): string;
}
