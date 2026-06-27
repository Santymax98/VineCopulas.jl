import { CommonOutputJax } from './common.js';
import { CommonWrapper as _CommonWrapper } from './common/Wrapper.js';
import { StyleJson, StyleJsonSheet } from '../util/StyleJson.js';
import { OptionList } from '../util/Options.js';
import { MathDocument } from '../core/MathDocument.js';
import { MathItem } from '../core/MathItem.js';
import { ChtmlWrapper, ChtmlWrapperClass } from './chtml/Wrapper.js';
import { ChtmlWrapperFactory } from './chtml/WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass, FontExtensionData } from './chtml/FontData.js';
import { Usage } from './chtml/Usage.js';
export declare class CHTML<N, T, D> extends CommonOutputJax<N, T, D, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    static NAME: string;
    static OPTIONS: OptionList;
    static commonStyles: StyleJson;
    static STYLESHEETID: string;
    wrapperUsage: Usage<string>;
    chtmlStyles: N;
    constructor(options?: OptionList);
    addExtension(font: FontExtensionData<ChtmlCharOptions, ChtmlDelimiterData>, prefix?: string): string[];
    escaped(math: MathItem<N, T, D>, html: MathDocument<N, T, D>): N;
    styleSheet(html: MathDocument<N, T, D>): N;
    protected updateFontStyles(styles: StyleJsonSheet): void;
    protected addWrapperStyles(styles: StyleJsonSheet): void;
    protected addClassStyles(wrapper: typeof _CommonWrapper, styles: StyleJsonSheet): void;
    insertStyles(styles: StyleJson): void;
    processMath(wrapper: ChtmlWrapper<N, T, D>, parent: N): void;
    clearCache(): void;
    reset(): void;
    unknownText(text: string, variant: string, width?: number): N;
    measureTextNode(textNode: N): {
        w: number;
        h: number;
        d: number;
    };
}
