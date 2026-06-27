import TexParser from '../TexParser.js';
import { Args, Attributes, ParseMethod } from '../Types.js';
import * as tm from '../TokenMap.js';
export declare enum NewcommandTables {
    NEW_DELIMITER = "new-Delimiter",
    NEW_COMMAND = "new-Command",
    NEW_ENVIRONMENT = "new-Environment"
}
export declare const NewcommandPriority = -100;
export declare const NewcommandUtil: {
    GetCSname(parser: TexParser, cmd: string): string;
    GetCsNameArgument(parser: TexParser, name: string): string;
    GetArgCount(parser: TexParser, name: string): string;
    GetTemplate(parser: TexParser, cmd: string, cs: string): number | string[];
    GetParameter(parser: TexParser, name: string, param: string): string;
    MatchParam(parser: TexParser, param: string): number;
    checkGlobal<T>(parser: TexParser, tokens: string[], maps: string[]): tm.AbstractParseMap<T>[];
    checkProtectedMacros(parser: TexParser, cs: string): void;
    addDelimiter(parser: TexParser, cs: string, char: string, attr: Attributes): void;
    addMacro(parser: TexParser, cs: string, func: ParseMethod, attr: Args[], token?: string): void;
    addEnvironment(parser: TexParser, env: string, func: ParseMethod, attr: Args[]): void;
    undefineMacro(parser: TexParser, cs: string): void;
    undefineDelimiter(parser: TexParser, cs: string): void;
};
