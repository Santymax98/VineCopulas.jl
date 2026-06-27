import { LiveRegion, SpeechRegion, ToolTip, HoverRegion } from './Region.js';
import type { ExplorerMathDocument, ExplorerMathItem } from '../explorer.js';
import { Explorer } from './Explorer.js';
import { SpeechExplorer } from './KeyExplorer.js';
import { Highlighter } from './Highlighter.js';
export declare class RegionPool {
    document: ExplorerMathDocument;
    speechRegion: SpeechRegion;
    brailleRegion: LiveRegion;
    magnifier: HoverRegion;
    tooltip1: ToolTip;
    tooltip2: ToolTip;
    tooltip3: ToolTip;
    constructor(document: ExplorerMathDocument);
}
export declare class ExplorerPool {
    secondaryHighlighter: Highlighter;
    explorers: {
        [key: string]: Explorer;
    };
    protected attached: string[];
    protected document: ExplorerMathDocument;
    protected node: HTMLElement;
    protected mml: string;
    private _highlighter;
    private _renderer;
    private _restart;
    get highlighter(): Highlighter;
    init(document: ExplorerMathDocument, node: HTMLElement, mml: string, item: ExplorerMathItem): void;
    private speechExplorerKeys;
    attach(): void;
    reattach(): void;
    restart(): void;
    protected setPrimaryHighlighter(): void;
    protected setSecondaryHighlighter(): void;
    highlight(nodes: HTMLElement[]): void;
    unhighlight(): void;
    get speech(): SpeechExplorer;
    private colorOptions;
}
