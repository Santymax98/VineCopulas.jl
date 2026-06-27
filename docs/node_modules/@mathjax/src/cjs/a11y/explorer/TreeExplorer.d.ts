import { A11yDocument, Region } from './Region.js';
import { AbstractExplorer } from './Explorer.js';
import { ExplorerPool } from './ExplorerPool.js';
export declare class AbstractTreeExplorer extends AbstractExplorer<void> {
    document: A11yDocument;
    pool: ExplorerPool;
    region: Region<void>;
    protected node: HTMLElement;
    protected mml: HTMLElement;
    protected constructor(document: A11yDocument, pool: ExplorerPool, region: Region<void>, node: HTMLElement, mml: HTMLElement);
    readonly stoppable = false;
    Attach(): void;
    Detach(): void;
}
export declare class FlameColorer extends AbstractTreeExplorer {
    Start(): void;
    Stop(): void;
}
export declare class TreeColorer extends AbstractTreeExplorer {
    contrast: ContrastPicker;
    private leaves;
    private modality;
    Start(): void;
    Stop(): void;
    private colorLeaves;
    colorize(node: HTMLElement): void;
    uncolorize(node: HTMLElement): void;
}
export declare class ContrastPicker {
    hue: number;
    sat: number;
    light: number;
    incr: number;
    generate(): string;
    increment(): void;
    static hsl2rgb(h: number, s: number, l: number): string;
}
