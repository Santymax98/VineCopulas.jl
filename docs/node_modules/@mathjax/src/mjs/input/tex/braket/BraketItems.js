import { BaseItem } from '../StackItem.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import { ParseUtil } from '../ParseUtil.js';
import { MATHSPACE, em } from '../../../util/lengths.js';
const THINSPACE = em(MATHSPACE.thinmathspace);
export class BraketItem extends BaseItem {
    constructor() {
        super(...arguments);
        this.barNodes = [];
    }
    get kind() {
        return 'braket';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('close')) {
            if (item.getProperty('braketbar')) {
                this.barNodes.push(...super.toMml(true, true).childNodes);
                this.Clear();
                return BaseItem.fail;
            }
            return [[this.factory.create('mml', this.toMml())], true];
        }
        if (item.isKind('mml')) {
            this.Push(item.toMml());
            if (this.getProperty('single')) {
                return [[this.toMml()], true];
            }
            return BaseItem.fail;
        }
        return super.checkItem(item);
    }
    toMml(inferred = true, forceRow) {
        let inner = super.toMml(inferred, forceRow);
        if (!inferred) {
            return inner;
        }
        const open = this.getProperty('open');
        const close = this.getProperty('close');
        if (this.barNodes.length) {
            inner = this.create('node', 'inferredMrow', [...this.barNodes, inner]);
        }
        if (this.getProperty('stretchy')) {
            if (this.getProperty('space')) {
                inner = this.create('node', 'inferredMrow', [
                    this.create('token', 'mspace', { width: THINSPACE }),
                    inner,
                    this.create('token', 'mspace', { width: THINSPACE }),
                ]);
            }
            return ParseUtil.fenced(this.factory.configuration, open, inner, close);
        }
        const attrs = {
            fence: true,
            stretchy: false,
            symmetric: true,
            texClass: TEXCLASS.OPEN,
        };
        const openNode = this.create('token', 'mo', attrs, open);
        attrs.texClass = TEXCLASS.CLOSE;
        const closeNode = this.create('token', 'mo', attrs, close);
        const mrow = this.create('node', 'mrow', [openNode, inner, closeNode], {
            open: open,
            close: close,
        });
        return mrow;
    }
}
//# sourceMappingURL=BraketItems.js.map