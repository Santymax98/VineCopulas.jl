export type StyleJsonData = {
    [property: string]: string | number;
};
export type StyleJson = {
    [selector: string]: StyleJsonData | StyleJson;
};
export declare class StyleJsonSheet {
    protected styles: StyleJson;
    get cssText(): string;
    constructor(styles?: StyleJson);
    addStyles(styles: StyleJson): void;
    removeStyles(...selectors: string[]): void;
    clear(): void;
    getStyleString(): string;
    getStyleRules(styles?: StyleJson, spaces?: string): string[];
    getStyleDefString(styles: StyleJsonData | StyleJson, spaces: string): string;
}
