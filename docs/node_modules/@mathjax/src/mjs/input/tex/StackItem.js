import TexError from './TexError.js';
import { TexConstant } from './TexConstants.js';
export class MmlStack {
    constructor(_nodes) {
        this._nodes = _nodes;
        this.startStr = '';
        this.startI = 0;
        this.stopI = 0;
    }
    get nodes() {
        return this._nodes;
    }
    Push(...nodes) {
        this._nodes.push(...nodes);
    }
    Pop() {
        return this._nodes.pop();
    }
    get First() {
        return this._nodes[this.Size() - 1];
    }
    set First(node) {
        this._nodes[this.Size() - 1] = node;
    }
    get Last() {
        return this._nodes[0];
    }
    set Last(node) {
        this._nodes[0] = node;
    }
    Peek(n) {
        if (n == null) {
            n = 1;
        }
        return this._nodes.slice(this.Size() - n);
    }
    Size() {
        return this._nodes.length;
    }
    Clear() {
        this._nodes = [];
    }
    toMml(inferred = true, forceRow) {
        if (this._nodes.length === 1 && !forceRow) {
            return this.First;
        }
        return this.create('node', inferred ? 'inferredMrow' : 'mrow', this._nodes, {});
    }
    create(kind, ...rest) {
        return this.factory.configuration.nodeFactory.create(kind, ...rest);
    }
}
export class BaseItem extends MmlStack {
    constructor(factory, ...nodes) {
        super(nodes);
        this.factory = factory;
        this.global = {};
        this._properties = {};
        if (this.isOpen) {
            this._env = {};
        }
    }
    get kind() {
        return 'base';
    }
    get env() {
        return this._env;
    }
    set env(value) {
        this._env = value;
    }
    get copyEnv() {
        return true;
    }
    getProperty(key) {
        return this._properties[key];
    }
    setProperty(key, value) {
        this._properties[key] = value;
        return this;
    }
    get isOpen() {
        return false;
    }
    get isClose() {
        return false;
    }
    get isFinal() {
        return false;
    }
    isKind(kind) {
        return kind === this.kind;
    }
    checkItem(item) {
        if (item.isKind('over') && this.isOpen) {
            item.setProperty('num', this.toMml(false));
            this.Clear();
        }
        if (item.isKind('cell') && this.isOpen) {
            if (item.getProperty('linebreak')) {
                return BaseItem.fail;
            }
            throw new TexError('Misplaced', 'Misplaced %1', item.getName());
        }
        if (item.isClose && this.getErrors(item.kind)) {
            const [id, message] = this.getErrors(item.kind);
            throw new TexError(id, message, item.getName());
        }
        if (!item.isFinal) {
            return BaseItem.success;
        }
        this.Push(item.First);
        return BaseItem.fail;
    }
    clearEnv() {
        for (const id of Object.keys(this.env)) {
            delete this.env[id];
        }
    }
    setProperties(def) {
        Object.assign(this._properties, def);
        return this;
    }
    getName() {
        return this.getProperty('name');
    }
    toString() {
        return this.kind + '[' + this.nodes.join('; ') + ']';
    }
    getErrors(kind) {
        const CLASS = this.constructor;
        return CLASS.errors[kind] || BaseItem.errors[kind];
    }
    addLatexItem(node, prefix = '') {
        const str = this.startStr.slice(this.startI, this.stopI);
        if (str) {
            const tex = prefix ? prefix + str : str;
            node.attributes.set(TexConstant.Attr.LATEXITEM, tex);
            if (tex !== '}') {
                node.attributes.set(TexConstant.Attr.LATEX, tex);
            }
        }
    }
}
BaseItem.fail = [null, false];
BaseItem.success = [null, true];
BaseItem.errors = {
    end: ['MissingBeginExtraEnd', 'Missing \\begin{%1} or extra \\end{%1}'],
    close: ['ExtraCloseMissingOpen', 'Extra close brace or missing open brace'],
    right: ['MissingLeftExtraRight', 'Missing \\left or extra \\right'],
    middle: ['ExtraMiddle', 'Extra \\middle'],
};
//# sourceMappingURL=StackItem.js.map