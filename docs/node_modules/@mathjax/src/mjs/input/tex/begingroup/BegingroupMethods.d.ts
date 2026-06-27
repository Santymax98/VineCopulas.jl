import TexParser from '../TexParser.js';
export declare const BegingroupMethods: {
    begingroup(parser: TexParser, _name: string): void;
    endgroup(parser: TexParser, _name: string): void;
    reset(parser: TexParser, _name: string): void;
    sandbox(parser: TexParser, _name: string): void;
    global(parser: TexParser, _name: string): void;
    macro: import("../Types.js").ParseMethod;
};
