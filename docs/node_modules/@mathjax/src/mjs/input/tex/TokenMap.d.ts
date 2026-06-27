import { Attributes, Args, ParseMethod, ParseInput, ParseResult } from './Types.js';
import { Token, Macro } from './Token.js';
export interface TokenMap {
    name: string;
    parser: ParseMethod;
    contains(token: string): boolean;
    parserFor(token: string): ParseMethod;
    parse([env, token]: ParseInput): ParseResult;
}
export declare function parseResult(result: ParseResult): ParseResult;
export declare abstract class AbstractTokenMap<T> implements TokenMap {
    private _name;
    private _parser;
    constructor(_name: string, _parser: ParseMethod);
    get name(): string;
    abstract contains(token: string): boolean;
    parserFor(token: string): ParseMethod;
    parse([env, token]: ParseInput): ParseResult;
    set parser(parser: ParseMethod);
    get parser(): ParseMethod;
    abstract lookup(token: string): T;
}
export declare class RegExpMap extends AbstractTokenMap<string> {
    private _regExp;
    constructor(name: string, parser: ParseMethod, _regExp: RegExp);
    contains(token: string): boolean;
    lookup(token: string): string;
}
export declare abstract class AbstractParseMap<K> extends AbstractTokenMap<K> {
    private map;
    lookup(token: string): K;
    contains(token: string): boolean;
    add(token: string, object: K): void;
    remove(token: string): void;
}
export declare class CharacterMap extends AbstractParseMap<Token> {
    constructor(name: string, parser: ParseMethod, json: {
        [index: string]: string | [string, Attributes];
    });
}
export declare class DelimiterMap extends CharacterMap {
    parse([env, token]: ParseInput): ParseResult;
}
type ParseFunction = string | ParseMethod;
export declare class MacroMap extends AbstractParseMap<Macro> {
    constructor(name: string, json: {
        [index: string]: ParseFunction | [ParseFunction, ...Args[]];
    }, functionMap?: {
        [key: string]: ParseMethod;
    });
    parserFor(token: string): ParseMethod;
    parse([env, token]: ParseInput): ParseResult;
}
export declare class CommandMap extends MacroMap {
    parse([env, token]: ParseInput): ParseResult;
}
export declare class EnvironmentMap extends MacroMap {
    constructor(name: string, parser: ParseMethod, json: {
        [index: string]: ParseFunction | [ParseFunction, ...Args[]];
    }, functionMap?: {
        [key: string]: ParseMethod;
    });
    parse([env, token]: ParseInput): ParseResult;
}
export {};
