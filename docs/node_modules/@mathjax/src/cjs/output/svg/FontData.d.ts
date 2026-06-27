import { CharMap, CharOptions, CharDataArray, VariantData, DelimiterData, FontData, FontExtensionData } from '../common/FontData.js';
export * from '../common/FontData.js';
export type CharStringMap = {
    [name: number]: string;
};
export interface SvgCharOptions extends CharOptions {
    c?: string;
    p?: string;
}
export type SvgCharMap = CharMap<SvgCharOptions>;
export type SvgCharData = CharDataArray<SvgCharOptions>;
export interface SvgVariantData extends VariantData<SvgCharOptions> {
    cacheID: string;
}
export interface SvgDelimiterData extends DelimiterData {
}
export interface SvgFontExtensionData<C extends SvgCharOptions, D extends SvgDelimiterData> extends FontExtensionData<C, D> {
    cacheIds?: {
        [variant: string]: string;
    };
}
export declare class SvgFontData extends FontData<SvgCharOptions, SvgVariantData, SvgDelimiterData> {
    static OPTIONS: {
        dynamicPrefix: string;
    };
    static JAX: string;
    static charOptions(font: SvgCharMap, n: number): SvgCharOptions;
    static addExtension(data: SvgFontExtensionData<SvgCharOptions, SvgDelimiterData>, prefix?: string): void;
}
export type SvgFontDataClass = typeof SvgFontData;
export declare function AddPaths(font: SvgCharMap, paths: CharStringMap, content: CharStringMap): SvgCharMap;
