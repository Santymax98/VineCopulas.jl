import { AbstractFactory } from './Factory.js';
export class AbstractWrapperFactory extends AbstractFactory {
    wrap(node, ...args) {
        return this.create(node.kind, node, ...args);
    }
}
//# sourceMappingURL=WrapperFactory.js.map