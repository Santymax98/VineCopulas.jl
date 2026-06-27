import { ArrayItem } from './base/BaseItems.js';
import TexParser from './TexParser.js';
export type ColumnState = {
    parser: TexParser;
    template: string;
    i: number;
    c: string;
    j: number;
    calign: string[];
    cwidth: string[];
    cspace: string[];
    clines: string[];
    cstart: string[];
    cend: string[];
    cextra: boolean[];
    ralign: [string, string, string][];
};
export type ColumnHandler = (state: ColumnState) => void;
export declare class ColumnParser {
    columnHandler: {
        [c: string]: ColumnHandler;
    };
    MAXCOLUMNS: number;
    process(parser: TexParser, template: string, array: ArrayItem): void;
    protected setColumnAlign(state: ColumnState, array: ArrayItem): void;
    protected setColumnWidths(state: ColumnState, array: ArrayItem): void;
    protected setColumnSpacing(state: ColumnState, array: ArrayItem): void;
    protected setColumnLines(state: ColumnState, array: ArrayItem): void;
    protected setPadding(state: ColumnState, array: ArrayItem): void;
    getColumn(state: ColumnState, ralign: string, calign?: string): void;
    getDimen(state: ColumnState): string;
    getAlign(state: ColumnState): string;
    getBraces(state: ColumnState): string;
    macroColumn(state: ColumnState, macro: string, n: number): void;
    addRule(state: ColumnState, rule: string): void;
    addAt(state: ColumnState, macro: string): void;
    addBang(state: ColumnState, macro: string): void;
    repeat(state: ColumnState): void;
}
