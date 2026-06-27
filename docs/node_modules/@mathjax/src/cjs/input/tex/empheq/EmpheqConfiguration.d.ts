import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { BeginItem } from '../base/BaseItems.js';
export declare const EmpheqMethods: {
    Empheq(parser: TexParser, begin: BeginItem): void;
    EmpheqMO(parser: TexParser, _name: string, c: string): void;
    EmpheqDelim(parser: TexParser, name: string): void;
};
export declare const EmpheqConfiguration: Configuration;
