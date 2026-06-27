import { Safe } from './safe.js';
export function SafeMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                this.safe = new this.options.SafeClass(this, this.options.safeOptions);
                for (const jax of this.inputJax) {
                    if (jax.name.match(/MathML/)) {
                        jax.mathml.filterAttribute = this.safe.mmlAttribute.bind(this.safe);
                        jax.mathml.filterClassList = this.safe.mmlClassList.bind(this.safe);
                    }
                    else if (jax.name.match(/TeX/)) {
                        jax.postFilters.add(this.sanitize.bind(jax), -5.5);
                    }
                }
            }
            sanitize(data) {
                data.math.root = this.parseOptions.root;
                data.document.safe.sanitize(data.math, data.document);
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { safeOptions: Object.assign({}, Safe.OPTIONS), SafeClass: Safe }),
        _a;
}
export function SafeHandler(handler) {
    handler.documentClass = SafeMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=SafeHandler.js.map