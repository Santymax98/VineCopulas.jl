import NodeUtil from './NodeUtil.js';
export default class Stack {
    constructor(_factory, _env, inner) {
        this._factory = _factory;
        this._env = _env;
        this.global = {};
        this.stack = [];
        this.global = { isInner: inner };
        this.stack = [this._factory.create('start', this.global)];
        if (_env) {
            this.stack[0].env = _env;
        }
        this.env = this.stack[0].env;
    }
    set env(env) {
        this._env = env;
    }
    get env() {
        return this._env;
    }
    Push(...args) {
        for (const node of args) {
            if (!node) {
                continue;
            }
            const item = NodeUtil.isNode(node)
                ? this._factory.create('mml', node)
                : node;
            item.global = this.global;
            const [top, success] = this.stack.length
                ? this.Top().checkItem(item)
                : [null, true];
            if (!success) {
                continue;
            }
            if (top) {
                this.Pop();
                this.Push(...top);
                continue;
            }
            if (!item.isKind('null')) {
                this.stack.push(item);
            }
            if (item.env) {
                if (item.copyEnv) {
                    Object.assign(item.env, this.env);
                }
                this.env = item.env;
            }
            else {
                item.env = this.env;
            }
        }
    }
    Pop() {
        const item = this.stack.pop();
        if (!item.isOpen) {
            delete item.env;
        }
        this.env = this.stack.length ? this.Top().env : {};
        return item;
    }
    Top(n = 1) {
        return this.stack.length < n ? null : this.stack[this.stack.length - n];
    }
    Prev(noPop) {
        const top = this.Top();
        return noPop ? top.First : top.Pop();
    }
    get height() {
        return this.stack.length;
    }
    toString() {
        return 'stack[\n  ' + this.stack.join('\n  ') + '\n]';
    }
}
//# sourceMappingURL=Stack.js.map