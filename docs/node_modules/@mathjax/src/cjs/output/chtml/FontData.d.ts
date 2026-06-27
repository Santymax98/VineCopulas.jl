import { CharMap, CharOptions, CharDataArray, VariantData, DelimiterData, FontData, FontExtensionData } from '../common/FontData.js';
import { Usage } from './Usage.js';
import { StringMap } from './Wrapper.js';
import { StyleJson, StyleJsonData } from '../../util/StyleJson.js';
export * from '../common/FontData.js';
export interface ChtmlCharOptions extends CharOptions {
    c?: string;
    f?: string;
    ff?: string;
    cmb?: boolean;
}
export type ChtmlCharMap = CharMap<ChtmlCharOptions>;
export type ChtmlCharData = CharDataArray<ChtmlCharOptions>;
export interface ChtmlVariantData extends VariantData<ChtmlCharOptions> {
    letter: string;
}
export interface ChtmlDelimiterData extends DelimiterData {
}
export interface ChtmlFontExtensionData<C extends ChtmlCharOptions, D extends ChtmlDelimiterData> extends FontExtensionData<C, D> {
    fonts?: string[];
    fontURL?: string;
}
export declare class ChtmlFontData extends FontData<ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData> {
    static OPTIONS: {
        dynamicPrefix: string;
        fontURL: string;
    };
    static JAX: string;
    protected static defaultVariantLetters: StringMap;
    protected static defaultStyles: {};
    protected static defaultFonts: {};
    protected static combiningChars: [number, number][];
    charUsage: Usage<[string, number]>;
    delimUsage: Usage<number>;
    fontUsage: StyleJson;
    protected newFonts: number;
    static charOptions(font: ChtmlCharMap, n: number): ChtmlCharOptions;
    static addFontURLs(styles: StyleJson, fonts: StyleJson, url: string): void;
    static addDynamicFontCss(styles: StyleJson, fonts: string[], root: string): void;
    static addExtension(data: ChtmlFontExtensionData<ChtmlCharOptions, ChtmlDelimiterData>, prefix?: string): void;
    addExtension(data: ChtmlFontExtensionData<ChtmlCharOptions, ChtmlDelimiterData>, prefix?: string): string[];
    adaptiveCSS(adapt: boolean): void;
    clearCache(): void;
    createVariant(name: string, inherit?: string, link?: string): void;
    defineChars(name: string, chars: ChtmlCharMap): void;
    addDynamicFontCss(fonts: string[], root?: string): void;
    updateDynamicStyles(): StyleJson;
    get styles(): StyleJson;
    updateStyles(styles: StyleJson): StyleJson;
    protected allStyles(styles: StyleJson): void;
    protected addDelimiterStyles(styles: StyleJson, n: number, data: ChtmlDelimiterData): void;
    protected addDelimiterVStyles(styles: StyleJson, n: number, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterVPart(styles: StyleJson, c: string, part: string, n: number, v: string, HDW: ChtmlCharData): number;
    protected addDelimiterHStyles(styles: StyleJson, n: number, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterHPart(styles: StyleJson, c: string, part: string, n: number, v: string, HDW: ChtmlCharData): number;
    protected addCharStyles(styles: StyleJson, vletter: string, n: number, data: ChtmlCharData): void;
    protected checkCombiningChar(options: ChtmlCharOptions, css: StyleJsonData): void;
    em(n: number): string;
    em0(n: number): string;
    em1(n: number): string;
    padding([h, d, w]: ChtmlCharData, ic?: number): string;
    charSelector(n: number): string;
}
export type ChtmlFontDataClass = typeof ChtmlFontData;
export type CharOptionsMap = {
    [name: number]: ChtmlCharOptions;
};
export type CssMap = {
    [name: number]: number;
};
export declare function AddCSS(font: ChtmlCharMap, options: CharOptionsMap): ChtmlCharMap;
