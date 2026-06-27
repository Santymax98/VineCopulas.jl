import { AbstractFindMath } from '../../core/FindMath.js';
const NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
export class FindMathML extends AbstractFindMath {
    findMath(node) {
        const set = new Set();
        this.findMathNodes(node, set);
        this.findMathPrefixed(node, set);
        const html = this.adaptor.root(this.adaptor.document);
        if (this.adaptor.kind(html) === 'html' && set.size === 0) {
            this.findMathNS(node, set);
        }
        return this.processMath(set);
    }
    findMathNodes(node, set) {
        for (const math of this.adaptor.tags(node, 'math')) {
            set.add(math);
        }
    }
    findMathPrefixed(node, set) {
        const html = this.adaptor.root(this.adaptor.document);
        for (const attr of this.adaptor.allAttributes(html)) {
            if (attr.name.substring(0, 6) === 'xmlns:' && attr.value === NAMESPACE) {
                const prefix = attr.name.substring(6);
                for (const math of this.adaptor.tags(node, prefix + ':math')) {
                    set.add(math);
                }
            }
        }
    }
    findMathNS(node, set) {
        for (const math of this.adaptor.tags(node, 'math', NAMESPACE)) {
            set.add(math);
        }
    }
    processMath(set) {
        const adaptor = this.adaptor;
        const math = [];
        for (const mml of set.values()) {
            if (adaptor.kind(adaptor.parent(mml)) === 'mjx-assistive-mml')
                continue;
            const display = adaptor.getAttribute(mml, 'display') === 'block' ||
                adaptor.getAttribute(mml, 'mode') === 'display';
            const start = { node: mml, n: 0, delim: '' };
            const end = { node: mml, n: 0, delim: '' };
            math.push({ math: adaptor.outerHTML(mml), start, end, display });
        }
        return math;
    }
}
FindMathML.OPTIONS = {};
//# sourceMappingURL=FindMathML.js.map