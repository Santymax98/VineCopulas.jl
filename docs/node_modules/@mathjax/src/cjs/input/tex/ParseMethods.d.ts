import { Token } from './Token.js';
import TexParser from './TexParser.js';
import { ParseMethod, ParseResult } from './Types.js';
declare const ParseMethods: {
    variable(parser: TexParser, c: string): void;
    digit(parser: TexParser, _c: string): ParseResult;
    controlSequence(parser: TexParser, _c: string): void;
    lcGreek(parser: TexParser, mchar: Token): void;
    ucGreek(parser: TexParser, mchar: Token): void;
    mathchar0mi(parser: TexParser, mchar: Token): void;
    mathchar0mo(parser: TexParser, mchar: Token): void;
    mathchar7(parser: TexParser, mchar: Token): void;
    delimiter(parser: TexParser, delim: Token): void;
    environment(parser: TexParser, env: string, func: ParseMethod, args: any[]): void;
};
export default ParseMethods;
