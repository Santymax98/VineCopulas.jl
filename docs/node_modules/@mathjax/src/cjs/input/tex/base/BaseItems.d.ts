import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import TexParser from '../TexParser.js';
import { PropertyList } from '../../../core/Tree/Node.js';
import StackItemFactory from '../StackItemFactory.js';
import { CheckType, BaseItem, StackItem, EnvList } from '../StackItem.js';
export declare class StartItem extends BaseItem {
    global: EnvList;
    constructor(factory: StackItemFactory, global: EnvList);
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
}
export declare class StopItem extends BaseItem {
    get kind(): string;
    get isClose(): boolean;
}
export declare class OpenItem extends BaseItem {
    protected static errors: any;
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
}
export declare class CloseItem extends BaseItem {
    get kind(): string;
    get isClose(): boolean;
}
export declare class NullItem extends BaseItem {
    get kind(): string;
}
export declare class PrimeItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class SubsupItem extends BaseItem {
    protected static errors: any;
    get kind(): string;
    checkItem(item: StackItem): CheckType | null;
}
export declare class OverItem extends BaseItem {
    constructor(factory: StackItemFactory);
    get kind(): string;
    get isClose(): boolean;
    checkItem(item: StackItem): CheckType;
    toString(): string;
}
export declare class LeftItem extends BaseItem {
    protected static errors: any;
    constructor(factory: StackItemFactory, delim: string);
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
}
export declare class Middle extends BaseItem {
    constructor(factory: StackItemFactory, delim: string, color: string);
    get kind(): string;
    get isClose(): boolean;
}
export declare class RightItem extends BaseItem {
    constructor(factory: StackItemFactory, delim: string, color: string);
    get kind(): string;
    get isClose(): boolean;
}
export declare class BreakItem extends BaseItem {
    get kind(): string;
    constructor(factory: StackItemFactory, linebreak: string, insert: boolean);
    checkItem(item: StackItem): CheckType;
}
export declare class BeginItem extends BaseItem {
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
}
export declare class EndItem extends BaseItem {
    get kind(): string;
    get isClose(): boolean;
}
export declare class StyleItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class PositionItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class CellItem extends BaseItem {
    get kind(): string;
    get isClose(): boolean;
}
export declare class MmlItem extends BaseItem {
    get isFinal(): boolean;
    get kind(): string;
}
export declare class FnItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class NotItem extends BaseItem {
    private remap;
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class NonscriptItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class DotsItem extends BaseItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class ArrayItem extends BaseItem {
    table: MmlNode[];
    row: MmlNode[];
    frame: [string, string][];
    hfill: number[];
    arraydef: {
        [key: string]: string | number | boolean;
    };
    cstart: string[];
    cend: string[];
    cextra: boolean[];
    atEnd: boolean;
    ralign: [string, string, string][];
    breakAlign: {
        cell: string;
        row: string;
        table: string;
    };
    templateSubs: number;
    parser: TexParser;
    get kind(): string;
    get isOpen(): boolean;
    get copyEnv(): boolean;
    checkItem(item: StackItem): CheckType;
    createMml(): MmlNode;
    protected handleFrame(mml: MmlNode): MmlNode;
    StartEntry(): void;
    protected getEntry(): [string, string, string, boolean];
    EndEntry(): void;
    EndRow(): void;
    EndTable(): void;
    checkLines(): void;
    addRowSpacing(spacing: string): void;
}
export declare class EqnArrayItem extends ArrayItem {
    maxrow: number;
    constructor(factory: StackItemFactory, ...args: any[]);
    get kind(): string;
    EndEntry(): void;
    EndRow(): void;
    EndTable(): void;
    protected extendArray(name: string, max: number): void;
    protected addIndentshift(): void;
}
export declare class MstyleItem extends BeginItem {
    get kind(): string;
    attrList: PropertyList;
    constructor(factory: StackItemFactory, attr: PropertyList, name: string);
    checkItem(item: StackItem): CheckType;
}
export declare class EquationItem extends BaseItem {
    constructor(factory: StackItemFactory, ...args: any[]);
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
}
