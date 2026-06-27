import { PropertyList } from '../../Tree/Node.js';
import { MmlNode, AbstractMmlNode, AttributeList } from '../MmlNode.js';
export declare class MmlMaction extends AbstractMmlNode {
    static defaults: PropertyList;
    get kind(): string;
    get arity(): number;
    get selected(): MmlNode;
    get isEmbellished(): boolean;
    get isSpacelike(): boolean;
    core(): MmlNode;
    coreMO(): MmlNode;
    protected verifyAttributes(options: PropertyList): void;
    setTeXclass(prev: MmlNode): MmlNode;
    nextToggleSelection(): void;
    protected setChildInheritedAttributes(attributes: AttributeList, display: boolean, level: number, prime: boolean): void;
}
