import { AbstractNodeFactory } from '../Tree/NodeFactory.js';
import { MML } from './MML.js';
export class MmlFactory extends AbstractNodeFactory {
    get MML() {
        return this.node;
    }
}
MmlFactory.defaultNodes = MML;
//# sourceMappingURL=MmlFactory.js.map