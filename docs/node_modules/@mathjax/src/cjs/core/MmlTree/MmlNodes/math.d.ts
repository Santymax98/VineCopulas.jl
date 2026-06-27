import { PropertyList } from '../../Tree/Node.js';
import { AbstractMmlLayoutNode, AttributeList } from '../MmlNode.js';
export declare class MmlMath extends AbstractMmlLayoutNode {
    static defaults: PropertyList;
    get kind(): string;
    get linebreakContainer(): boolean;
    get linebreakAlign(): string;
    protected setChildInheritedAttributes(attributes: AttributeList, display: boolean, level: number, prime: boolean): void;
    verifyTree(options?: PropertyList): void;
}
