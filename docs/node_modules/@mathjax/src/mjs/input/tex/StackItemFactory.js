import { BaseItem } from './StackItem.js';
import { AbstractFactory } from '../../core/Tree/Factory.js';
class DummyItem extends BaseItem {
}
class StackItemFactory extends AbstractFactory {
    constructor() {
        super(...arguments);
        this.defaultKind = 'dummy';
        this.configuration = null;
    }
}
StackItemFactory.DefaultStackItems = {
    [DummyItem.prototype.kind]: DummyItem,
};
export default StackItemFactory;
//# sourceMappingURL=StackItemFactory.js.map