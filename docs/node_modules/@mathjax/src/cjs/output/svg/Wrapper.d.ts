import { OptionList } from '../../util/Options.js';
import { CommonWrapper, CommonWrapperClass, CommonWrapperConstructor } from '../common/Wrapper.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from './FontData.js';
import { SVG } from '../svg.js';
import { SvgWrapperFactory } from './WrapperFactory.js';
export { Constructor, StringMap } from '../common/Wrapper.js';
export type SvgConstructor<N, T, D> = CommonWrapperConstructor<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass>;
export interface SvgWrapperClass<N, T, D> extends CommonWrapperClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export declare class SvgWrapper<N, T, D> extends CommonWrapper<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    static kind: string;
    static borderFuzz: number;
    dx: number;
    protected utext: string;
    font: SvgFontData;
    toSVG(parents: N[]): void;
    toEmbellishedSVG(parents: N[]): boolean;
    addChildren(parents: N[]): void;
    protected standardSvgNodes(parents: N[]): N[];
    protected createSvgNodes(parents: N[]): N[];
    protected handleHref(parents: N[]): N[];
    protected handleStyles(): void;
    protected handleScale(): void;
    protected handleColor(): void;
    protected handleBorder(): void;
    protected addBorderSolid(path: number[][], color: string, child: N, parent: N, dx: number): void;
    protected addBorderBroken(path: number[][], color: string, style: string, t: number, i: number, parent: N, dx: number): void;
    protected handleAttributes(): void;
    place(x: number, y: number, element?: N): void;
    protected handleId(y: number): number;
    firstChild(dom?: N): N;
    placeChar(n: number, x: number, y: number, parent: N, variant?: string, buffer?: boolean): number;
    protected addUtext(x: number, y: number, parent: N, variant: string): number;
    protected charNode(variant: string, C: string, path: string): N;
    protected pathNode(C: string, path: string): N;
    protected useNode(variant: string, C: string, path: string): N;
    drawBBox(): void;
    html(type: string, def?: OptionList, content?: (N | T)[]): N;
    svg(type: string, def?: OptionList, content?: (N | T)[]): N;
    text(text: string): T;
    fixed(x: number, n?: number): string;
}
