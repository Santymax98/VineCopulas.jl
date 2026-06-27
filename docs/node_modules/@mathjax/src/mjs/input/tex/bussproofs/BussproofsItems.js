import TexError from '../TexError.js';
import { BaseItem } from '../StackItem.js';
import Stack from '../Stack.js';
import * as BussproofsUtil from './BussproofsUtil.js';
export class ProofTreeItem extends BaseItem {
    constructor() {
        super(...arguments);
        this.leftLabel = null;
        this.rigthLabel = null;
        this.innerStack = new Stack(this.factory, {}, true);
    }
    get kind() {
        return 'proofTree';
    }
    checkItem(item) {
        if (item.isKind('end') && item.getName() === 'prooftree') {
            const node = this.toMml();
            BussproofsUtil.setProperty(node, 'proof', true);
            return [[this.factory.create('mml', node), item], true];
        }
        if (item.isKind('stop')) {
            throw new TexError('EnvMissingEnd', 'Missing \\end{%1}', this.getName());
        }
        this.innerStack.Push(item);
        return BaseItem.fail;
    }
    toMml() {
        const tree = super.toMml();
        const start = this.innerStack.Top();
        if (start.isKind('start') && !start.Size()) {
            return tree;
        }
        this.innerStack.Push(this.factory.create('stop'));
        const prefix = this.innerStack.Top().toMml();
        return this.create('node', 'mrow', [prefix, tree], {});
    }
}
//# sourceMappingURL=BussproofsItems.js.map