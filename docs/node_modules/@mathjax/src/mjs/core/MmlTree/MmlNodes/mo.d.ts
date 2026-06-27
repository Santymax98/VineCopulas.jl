import { PropertyList } from '../../Tree/Node.js';
import { AbstractMmlTokenNode, MmlNode, AttributeList } from '../MmlNode.js';
import { OperatorDef, OperatorList } from '../OperatorDictionary.js';
export declare class MmlMo extends AbstractMmlTokenNode {
    static defaults: PropertyList;
    static MMLSPACING: number[][];
    static OPTABLE: {
        [form: string]: OperatorList;
    };
    static pseudoScripts: RegExp;
    protected static primes: RegExp;
    protected static opPattern: RegExp;
    protected static remapPrimes: {
        [n: number]: number;
    };
    static mathaccents: RegExp;
    static mathaccentsWithWidth: RegExp;
    _texClass: number;
    get texClass(): number;
    set texClass(value: number);
    lspace: number;
    rspace: number;
    get kind(): string;
    get isEmbellished(): boolean;
    coreParent(): MmlNode;
    coreText(parent: MmlNode): string;
    hasSpacingAttributes(): boolean;
    get isAccent(): boolean;
    setTeXclass(prev: MmlNode): MmlNode;
    adjustTeXclass(prev: MmlNode): MmlNode;
    setInheritedAttributes(attributes?: AttributeList, display?: boolean, level?: number, prime?: boolean): void;
    protected getOperatorDef(mo: string): OperatorDef;
    protected checkOperatorTable(mo: string): void;
    getForms(): [string, string, string];
    protected handleExplicitForm(forms: string[]): string[];
    protected checkPseudoScripts(mo: string): void;
    protected checkPrimes(mo: string): void;
    protected checkMathAccent(mo: string): void;
    isMathAccent(mo?: string): boolean;
    isMathAccentWithWidth(mo?: string): boolean;
}
