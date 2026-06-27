import { StackItem } from './StackItem.js';
import { Token } from './Token.js';
import TexParser from './TexParser.js';
export type Args = boolean | number | string | null;
export type Attributes = Record<string, Args>;
export type Environment = Record<string, Args>;
export type ParseInput = [TexParser, string];
export type ParseResult = void | boolean | StackItem | symbol;
export type ParseMethod = (parser: TexParser, c: string | Token | StackItem, ...rest: any[]) => ParseResult;
