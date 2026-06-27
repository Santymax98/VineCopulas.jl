import { AbstractWrapperFactory } from '../../core/Tree/WrapperFactory.js';
export class CommonWrapperFactory extends AbstractWrapperFactory {
    constructor() {
        super(...arguments);
        this.jax = null;
    }
    get Wrappers() {
        return this.node;
    }
}
CommonWrapperFactory.defaultNodes = {};
//# sourceMappingURL=WrapperFactory.js.map