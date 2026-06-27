import { SerializedMmlVisitor } from '../../core/MmlTree/SerializedMmlVisitor.js';
import { userOptions } from '../../util/Options.js';
export class MmlVisitor extends SerializedMmlVisitor {
    constructor() {
        super(...arguments);
        this.options = {
            filterSRE: true,
            filterTex: true,
            texHints: true,
            semantics: false,
        };
        this.mathItem = null;
    }
    visitTree(node, math = null, options = {}) {
        this.mathItem = math;
        userOptions(this.options, options);
        return this.visitNode(node, '');
    }
    visitTeXAtomNode(node, space) {
        if (this.options.texHints) {
            return super.visitDefault(node, space);
        }
        if (node.childNodes[0] && node.childNodes[0].childNodes.length === 1) {
            return this.visitNode(node.childNodes[0], space);
        }
        return (`${space}<mrow${this.getAttributes(node)}>\n` +
            this.childNodeMml(node, space + '  ', '\n') +
            `${space}</mrow>`);
    }
    visitMathNode(node, space) {
        if (!this.options.semantics || this.mathItem.inputJax.name !== 'TeX') {
            return super.visitDefault(node, space);
        }
        const addRow = node.childNodes.length && node.childNodes[0].childNodes.length > 1;
        return (`${space}<math${this.getAttributes(node)}>\n${space}  <semantics>\n` +
            (addRow ? space + '    <mrow>\n' : '') +
            this.childNodeMml(node, space + (addRow ? '      ' : '    '), '\n') +
            (addRow ? space + '    </mrow>\n' : '') +
            `${space}    <annotation encoding="application/x-tex">` +
            this.mathItem.math +
            `</annotation>\n${space}  </semantics>\n${space}</math>`);
    }
    getAttributeList(node) {
        const list = super.getAttributeList(node);
        if (this.options.filterTex) {
            delete list['data-latex'];
            delete list['data-latex-item'];
        }
        if (this.options.filterSRE) {
            const keys = Object.keys(list).filter((id) => id.match(/^(?:data-semantic-.*?|data-speech-node|role|aria-(?:level|posinset|setsize|owns))$/));
            for (const key of keys) {
                delete list[key];
            }
        }
        return list;
    }
}
//# sourceMappingURL=MmlVisitor.js.map