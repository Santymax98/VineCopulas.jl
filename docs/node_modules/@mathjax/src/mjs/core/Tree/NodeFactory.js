import { AbstractFactory } from './Factory.js';
export class AbstractNodeFactory extends AbstractFactory {
    create(kind, properties = {}, children = []) {
        return this.node[kind](properties, children);
    }
}
//# sourceMappingURL=NodeFactory.js.map