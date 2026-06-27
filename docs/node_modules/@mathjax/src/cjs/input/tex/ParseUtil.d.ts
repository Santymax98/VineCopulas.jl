import { MmlNode } from '../../core/MmlTree/MmlNode.js';
import { EnvList } from './StackItem.js';
import { ArrayItem } from './base/BaseItems.js';
import ParseOptions from './ParseOptions.js';
import TexParser from './TexParser.js';
export declare class KeyValueDef<T> {
    name: string;
    verify: (value: string) => boolean;
    convert: (value: string) => T;
    static oneof(...values: string[]): KeyValueDef<string>;
    constructor(name: string, verify: (value: string) => boolean, convert: (value: string) => T);
}
export type KeyValueFn = (...data: any[]) => KeyValueDef<any>;
export type KeyValueType = KeyValueDef<any>;
export declare const KeyValueTypes: {
    [name: string]: KeyValueType;
};
export declare const ParseUtil: {
    cols(...W: number[]): string;
    fenced(configuration: ParseOptions, open: string, mml: MmlNode, close: string, big?: string, color?: string): MmlNode;
    fixedFence(configuration: ParseOptions, open: string, mml: MmlNode, close: string): MmlNode;
    mathPalette(configuration: ParseOptions, fence: string, side: string): MmlNode;
    fixInitialMO(configuration: ParseOptions, nodes: MmlNode[]): void;
    internalMath(parser: TexParser, text: string, level?: number | string, font?: string): MmlNode[];
    internalText(parser: TexParser, text: string, def: EnvList): MmlNode;
    underOver(parser: TexParser, base: MmlNode, script: MmlNode, pos: string, stack: boolean): MmlNode;
    checkMovableLimits(base: MmlNode): void;
    setArrayAlign(array: ArrayItem, align: string, parser?: TexParser): ArrayItem;
    substituteArgs(parser: TexParser, args: string[], str: string): string;
    addArgs(parser: TexParser, s1: string, s2: string): string;
    checkMaxMacros(parser: TexParser, isMacro?: boolean): void;
    checkEqnEnv(parser: TexParser, nestable?: boolean): void;
    copyNode(node: MmlNode, parser: TexParser): MmlNode;
    mmlFilterAttribute(_parser: TexParser, _name: string, value: string): string;
    getFontDef(parser: TexParser): EnvList;
    keyvalOptions(attrib: string, allowed?: {
        [key: string]: number | KeyValueType;
    }, error?: boolean, l3keys?: boolean): EnvList;
    isLatinOrGreekChar(c: string): boolean;
};
