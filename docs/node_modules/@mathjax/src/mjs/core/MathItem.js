export function protoItem(open, math, close, n, start, end, display = null) {
    const item = {
        open: open,
        math: math,
        close: close,
        n: n,
        start: { n: start },
        end: { n: end },
        display: display,
    };
    return item;
}
export class AbstractMathItem {
    get isEscaped() {
        return this.display === null;
    }
    constructor(math, jax, display = true, start = { i: 0, n: 0, delim: '' }, end = { i: 0, n: 0, delim: '' }) {
        this.root = null;
        this.typesetRoot = null;
        this.metrics = {};
        this.inputData = {};
        this.outputData = {};
        this._state = STATE.UNPROCESSED;
        this.math = math;
        this.inputJax = jax;
        this.display = display;
        this.start = start;
        this.end = end;
        this.root = null;
        this.typesetRoot = null;
        this.metrics = {};
        this.inputData = {};
        this.outputData = {};
    }
    render(document) {
        document.renderActions.renderMath(this, document);
    }
    rerender(document, start = STATE.RERENDER) {
        if (this.state() >= start) {
            this.state(start - 1);
        }
        document.renderActions.renderMath(this, document, start);
    }
    convert(document, end = STATE.LAST) {
        document.renderActions.renderConvert(this, document, end);
    }
    compile(document) {
        if (this.state() < STATE.COMPILED) {
            this.root = this.inputJax.compile(this, document);
            this.state(STATE.COMPILED);
        }
    }
    typeset(document) {
        if (this.state() < STATE.TYPESET) {
            this.typesetRoot = document.outputJax[this.isEscaped ? 'escaped' : 'typeset'](this, document);
            this.state(STATE.TYPESET);
        }
    }
    updateDocument(_document) { }
    removeFromDocument(_restore = false) {
        this.clear();
    }
    setMetrics(em, ex, cwidth, scale) {
        this.metrics = {
            em: em,
            ex: ex,
            containerWidth: cwidth,
            scale: scale,
        };
    }
    state(state = null, restore = false) {
        if (state != null) {
            if (state < STATE.INSERTED && this._state >= STATE.INSERTED) {
                this.removeFromDocument(restore);
            }
            if (state < STATE.TYPESET && this._state >= STATE.TYPESET) {
                this.outputData = {};
            }
            if (state < STATE.COMPILED && this._state >= STATE.COMPILED) {
                this.inputData = {};
            }
            this._state = state;
        }
        return this._state;
    }
    reset(restore = false) {
        this.state(STATE.UNPROCESSED, restore);
    }
    clear() { }
}
export const STATE = {
    UNPROCESSED: 0,
    FINDMATH: 10,
    COMPILED: 20,
    CONVERT: 100,
    METRICS: 110,
    RERENDER: 125,
    TYPESET: 150,
    INSERTED: 200,
    LAST: 10000,
};
export function newState(name, state) {
    if (name in STATE) {
        throw Error('State ' + name + ' already exists');
    }
    STATE[name] = state;
}
//# sourceMappingURL=MathItem.js.map