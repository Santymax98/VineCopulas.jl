import { HandlerType } from '../HandlerTypes.js';
import { TokenMap } from '../TokenMap.js';
import { SubHandlers } from '../MapHandler.js';
import { NewcommandTables as NT } from '../newcommand/NewcommandUtil.js';
import ParseOptions from '../ParseOptions.js';
type HANDLERTYPE = NT.NEW_DELIMITER | NT.NEW_ENVIRONMENT | NT.NEW_COMMAND;
export declare class BegingroupStack {
    static handlerConfig: {
        delimiter: NT[];
        environment: NT[];
        macro: NT[];
    };
    static handlerMap: {
        "new-Delimiter": HandlerType;
        "new-Environment": HandlerType;
        "new-Command": HandlerType;
    };
    protected i: number;
    protected top: number;
    protected base: number;
    protected MARKER: any;
    handlers: SubHandlers;
    global: {
        [name: string]: TokenMap;
    };
    constructor(parser: ParseOptions);
    protected getGlobal(): void;
    checkGlobal(tokens: string[], maps: HANDLERTYPE[]): TokenMap[];
    push(): void;
    pop(): void;
    finish(): void;
    remove(): void;
    reset(): void;
    sandbox(): void;
}
export declare function begingroupStack(parser: ParseOptions): BegingroupStack;
export {};
