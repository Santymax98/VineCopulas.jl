import { Token } from '../Token.js';
import { TextParser } from '../textmacros/TextParser.js';
import TexParser from '../TexParser.js';
export declare const BboldxMethods: {
    Macro: import("../Types.js").ParseMethod;
    ChooseFont: (parser: TexParser, name: string, normal: string, light: string, bfbb: string) => void;
    ChooseTextFont: (parser: TextParser, name: string, normal: string, light: string, bfbb: string) => void;
    mathchar0miNormal: (parser: TexParser, mchar: Token) => void;
    delimiterNormal: (parser: TexParser, delim: Token) => void;
    mathchar0miBold: (parser: TexParser, mchar: Token) => void;
    delimiterBold: (parser: TexParser, delim: Token) => void;
};
