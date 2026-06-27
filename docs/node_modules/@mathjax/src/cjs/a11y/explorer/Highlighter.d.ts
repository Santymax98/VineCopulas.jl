export interface NamedColor {
    color: string;
    alpha?: number;
}
export declare const ATTR: {
    ENCLOSED: string;
    BBOX: string;
    ADDED: string;
};
export interface Highlighter {
    highlight(nodes: HTMLElement[]): void;
    unhighlight(): void;
    highlightAll(node: HTMLElement): void;
    unhighlightAll(): void;
    encloseNodes(parts: HTMLElement[], node: HTMLElement): HTMLElement[];
    isMactionNode(node: Element): boolean;
    getMactionNodes(node: HTMLElement): HTMLElement[];
    setColor(background: NamedColor, foreground: NamedColor): void;
}
export declare function getHighlighter(priority: number, back: NamedColor, fore: NamedColor, renderer: string): Highlighter;
