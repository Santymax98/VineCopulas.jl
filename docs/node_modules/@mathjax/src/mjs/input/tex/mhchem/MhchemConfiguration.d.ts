import { Configuration } from '../Configuration.js';
import { Token } from '../Token.js';
import { ParseMethod } from '../Types.js';
import TexParser from '../TexParser.js';
export declare const MhchemUtils: {
    relmo(parser: TexParser, mchar: Token): void;
};
export declare const MhchemReplacements: Map<string | ((match: string, arrow: string) => string), RegExp>;
export declare const MhchemMethods: {
    [key: string]: ParseMethod;
};
export declare const MhchemConfiguration: Configuration;
