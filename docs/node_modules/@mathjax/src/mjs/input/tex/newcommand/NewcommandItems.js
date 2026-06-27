import TexError from '../TexError.js';
import { BaseItem } from '../StackItem.js';
export class BeginEnvItem extends BaseItem {
    get kind() {
        return 'beginEnv';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('end')) {
            if (item.getName() !== this.getName()) {
                throw new TexError('EnvBadEnd', '\\begin{%1} ended with \\end{%2}', this.getName(), item.getName());
            }
            return [[this.factory.create('mml', this.toMml())], true];
        }
        if (item.isKind('stop')) {
            throw new TexError('EnvMissingEnd', 'Missing \\end{%1}', this.getName());
        }
        return super.checkItem(item);
    }
}
//# sourceMappingURL=NewcommandItems.js.map