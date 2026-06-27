import { Args, Attributes, ParseMethod } from './Types.js';
export declare class Token {
    private _token;
    private _char;
    private _attributes;
    constructor(_token: string, _char: string, _attributes: Attributes);
    get token(): string;
    get char(): string;
    get attributes(): Attributes;
}
export declare class Macro {
    private _token;
    private _func;
    private _args;
    constructor(_token: string, _func: ParseMethod, _args?: Args[]);
    get token(): string;
    get func(): ParseMethod;
    get args(): Args[];
}
