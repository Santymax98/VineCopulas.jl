import { Configuration } from '../Configuration.js';
import { ParseResult, ParseMethod } from '../Types.js';
import TexParser from '../TexParser.js';
import { BeginItem } from '../base/BaseItems.js';
import { AmsTags } from '../ams/AmsConfiguration.js';
import { StackItem, CheckType } from '../StackItem.js';
export declare class CasesBeginItem extends BeginItem {
    get kind(): string;
    checkItem(item: StackItem): CheckType;
}
export declare class CasesTags extends AmsTags {
    protected subcounter: number;
    start(env: string, taggable: boolean, defaultTags: boolean): void;
    autoTag(): void;
    formatNumber(n: number, m?: number): string;
}
export declare const CasesMethods: {
    NumCases(parser: TexParser, begin: CasesBeginItem): ParseResult;
    Entry(parser: TexParser, name: string): ParseResult;
    environment(parser: TexParser, env: string, func: ParseMethod, args: any[]): void;
};
export declare const CasesConfiguration: Configuration;
