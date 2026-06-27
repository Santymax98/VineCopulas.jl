import { STATE, newState } from '../core/MathItem.js';
import { EnrichHandler, } from './semantic-enrich.js';
import { ComplexityVisitor } from './complexity/visitor.js';
import { selectOptionsFromKeys, expandable, } from '../util/Options.js';
newState('COMPLEXITY', 40);
export function ComplexityMathItemMixin(BaseMathItem, computeComplexity) {
    return class extends BaseMathItem {
        constructor() {
            super(...arguments);
            this.initialID = null;
        }
        complexity(document, force = false) {
            if (this.state() >= STATE.COMPLEXITY)
                return;
            if (!this.isEscaped && (document.options.enableComplexity || force)) {
                this.enrich(document, true);
                computeComplexity(this);
            }
            this.state(STATE.COMPLEXITY);
        }
    };
}
export function ComplexityMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('complexity')) {
                    ProcessBits.allocate('complexity');
                }
                const visitorOptions = selectOptionsFromKeys(this.options, this.options.ComplexityVisitor.OPTIONS);
                this.complexityVisitor = new this.options.ComplexityVisitor(this.mmlFactory, visitorOptions);
                const computeComplexity = (math) => {
                    math.initialID = this.complexityVisitor.visitTree(math.root, math.initialID);
                };
                this.options.MathItem = ComplexityMathItemMixin(this.options.MathItem, computeComplexity);
            }
            complexity() {
                if (!this.processed.isSet('complexity')) {
                    if (this.options.enableComplexity) {
                        for (const math of this.math) {
                            math.complexity(this);
                        }
                    }
                    this.processed.set('complexity');
                }
                return this;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.COMPLEXITY) {
                    this.processed.clear('complexity');
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign(Object.assign({}, BaseDocument.OPTIONS), ComplexityVisitor.OPTIONS), { enableComplexity: true, ComplexityVisitor: ComplexityVisitor, renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { complexity: [STATE.COMPLEXITY] })) }),
        _a;
}
export function ComplexityHandler(handler, MmlJax = null) {
    if (!handler.documentClass.prototype.enrich && MmlJax) {
        handler = EnrichHandler(handler, MmlJax);
    }
    handler.documentClass = ComplexityMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=complexity.js.map