import { HandlerType } from './HandlerTypes.js';
import { TokenMap } from './TokenMap.js';
import { ParseInput, ParseResult, ParseMethod } from './Types.js';
export type HandlerConfig = {
    [P in HandlerType]?: string[];
};
export type FallbackConfig = {
    [P in HandlerType]?: ParseMethod;
};
export declare const MapHandler: {
    register(map: TokenMap): void;
    getMap(name: string): TokenMap;
};
export declare class SubHandler {
    static FALLBACK: symbol;
    private _configuration;
    private _fallback;
    add(maps: string[], fallback: ParseMethod, priority?: number): void;
    remove(maps: string[], fallback?: ParseMethod): void;
    parse(input: ParseInput): ParseResult;
    lookup<T>(token: string): T;
    contains(token: string): boolean;
    toString(): string;
    applicable(token: string): TokenMap;
    retrieve(name: string): TokenMap;
    private warn;
}
export declare class SubHandlers {
    private map;
    add(handlers: HandlerConfig, fallbacks: FallbackConfig, priority?: number): void;
    remove(handlers: HandlerConfig, fallbacks: FallbackConfig): void;
    set(name: HandlerType, subHandler: SubHandler): void;
    get(name: HandlerType): SubHandler;
    retrieve(name: string): TokenMap;
    keys(): IterableIterator<string>;
}
