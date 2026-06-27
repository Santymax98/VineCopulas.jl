import { PropertyList } from '../../Tree/Node.js';
import { AbstractMmlLayoutNode, MmlNode } from '../MmlNode.js';
export declare class MmlMpadded extends AbstractMmlLayoutNode {
    static defaults: PropertyList;
    get kind(): string;
    get linebreakContainer(): boolean;
    setTeXclass(prev: MmlNode): MmlNode;
}
