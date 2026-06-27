import { A11yDocument, Region } from './Region.js';
import { Highlighter } from './Highlighter.js';
import type { ExplorerPool } from './ExplorerPool.js';
export interface Explorer {
    active: boolean;
    stoppable: boolean;
    pool: ExplorerPool;
    Attach(): void;
    Detach(): void;
    Start(): void;
    Stop(): void;
    AddEvents(): void;
    RemoveEvents(): void;
    Update(force?: boolean): void;
}
export declare class AbstractExplorer<T> implements Explorer {
    document: A11yDocument;
    pool: ExplorerPool;
    region: Region<T>;
    protected node: HTMLElement;
    stoppable: boolean;
    protected events: [string, (x: Event) => void][];
    protected get highlighter(): Highlighter;
    private _active;
    protected static stopEvent(event: Event): void;
    static create<T>(document: A11yDocument, pool: ExplorerPool, region: Region<T>, node: HTMLElement, ...rest: any[]): Explorer;
    protected constructor(document: A11yDocument, pool: ExplorerPool, region: Region<T>, node: HTMLElement, ..._rest: any[]);
    protected Events(): [string, (x: Event) => void][];
    get active(): boolean;
    set active(flag: boolean);
    Attach(): void;
    Detach(): void;
    Start(): void;
    Stop(): void;
    AddEvents(): void;
    RemoveEvents(): void;
    Update(_force?: boolean): void;
    protected stopEvent(event: Event): void;
}
