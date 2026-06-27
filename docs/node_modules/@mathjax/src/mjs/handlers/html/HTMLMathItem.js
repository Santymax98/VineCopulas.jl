import { AbstractMathItem, STATE } from '../../core/MathItem.js';
export class HTMLMathItem extends AbstractMathItem {
    get adaptor() {
        return this.inputJax.adaptor;
    }
    constructor(math, jax, display = true, start = { node: null, n: 0, delim: '' }, end = { node: null, n: 0, delim: '' }) {
        super(math, jax, display, start, end);
    }
    updateDocument(_html) {
        if (this.state() < STATE.INSERTED) {
            if (this.inputJax.processStrings) {
                let node = this.start.node;
                if (node === this.end.node) {
                    if (this.end.n &&
                        this.end.n < this.adaptor.value(this.end.node).length) {
                        this.adaptor.split(this.end.node, this.end.n);
                    }
                    if (this.start.n) {
                        node = this.adaptor.split(this.start.node, this.start.n);
                    }
                    if (this.adaptor.parent(node)) {
                        this.adaptor.replace(this.typesetRoot, node);
                    }
                }
                else {
                    if (this.start.n) {
                        node = this.adaptor.split(node, this.start.n);
                    }
                    while (node !== this.end.node) {
                        const next = this.adaptor.next(node);
                        this.adaptor.remove(node);
                        node = next;
                    }
                    this.adaptor.insert(this.typesetRoot, node);
                    if (this.end.n < this.adaptor.value(node).length) {
                        this.adaptor.split(node, this.end.n);
                    }
                    this.adaptor.remove(node);
                }
            }
            else {
                this.adaptor.replace(this.typesetRoot, this.start.node);
            }
            this.start.node = this.end.node = this.typesetRoot;
            this.start.n = this.end.n = 0;
            this.state(STATE.INSERTED);
        }
    }
    updateStyleSheet(document) {
        document.addStyleSheet();
    }
    removeFromDocument(restore = false) {
        super.removeFromDocument(restore);
        if (this.state() >= STATE.TYPESET) {
            const adaptor = this.adaptor;
            const node = this.start.node;
            let math = adaptor.text('');
            if (restore) {
                const text = this.start.delim + this.math + this.end.delim;
                if (this.inputJax.processStrings) {
                    math = adaptor.text(text);
                }
                else {
                    const doc = adaptor.parse(text, 'text/html');
                    math = adaptor.firstChild(adaptor.body(doc));
                }
            }
            if (adaptor.parent(node)) {
                adaptor.replace(math, node);
            }
            this.start.node = this.end.node = math;
            this.start.n = this.end.n = 0;
        }
    }
}
//# sourceMappingURL=HTMLMathItem.js.map