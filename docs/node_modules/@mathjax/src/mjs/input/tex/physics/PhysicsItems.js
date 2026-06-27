import { BaseItem } from '../StackItem.js';
import { ParseUtil } from '../ParseUtil.js';
import NodeUtil from '../NodeUtil.js';
import TexParser from '../TexParser.js';
export class AutoOpen extends BaseItem {
    constructor() {
        super(...arguments);
        this.openCount = 0;
    }
    get kind() {
        return 'auto open';
    }
    get isOpen() {
        return true;
    }
    toMml(inferred = true, forceRow) {
        if (!inferred) {
            return super.toMml(inferred, forceRow);
        }
        const parser = this.factory.configuration.parser;
        const right = this.getProperty('right');
        if (this.getProperty('smash')) {
            const mml = super.toMml();
            const smash = parser.create('node', 'mpadded', [mml], {
                height: 0,
                depth: 0,
            });
            this.Clear();
            this.Push(parser.create('node', 'TeXAtom', [smash]));
        }
        if (right) {
            this.Push(new TexParser(right, parser.stack.env, parser.configuration).mml());
        }
        const mml = ParseUtil.fenced(this.factory.configuration, this.getProperty('open'), super.toMml(), this.getProperty('close'), this.getProperty('big'));
        NodeUtil.removeProperties(mml, 'open', 'close', 'texClass');
        return mml;
    }
    closing(fence) {
        return fence === this.getProperty('close') && !this.openCount--;
    }
    checkItem(item) {
        if (item.getProperty('pre-autoclose')) {
            return BaseItem.fail;
        }
        if (item.getProperty('autoclose')) {
            if (this.getProperty('ignore')) {
                this.Clear();
                return [[], true];
            }
            return [[this.toMml()], true];
        }
        if (item.isKind('mml') && item.Size() === 1) {
            const mml = item.toMml();
            if (mml.isKind('mo') &&
                mml.getText() === this.getProperty('open')) {
                this.openCount++;
            }
        }
        return super.checkItem(item);
    }
}
AutoOpen.errors = Object.assign(Object.create(BaseItem.errors), {
    stop: ['ExtraOrMissingDelims', 'Extra open or missing close delimiter'],
});
//# sourceMappingURL=PhysicsItems.js.map