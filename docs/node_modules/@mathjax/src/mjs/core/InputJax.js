import { userOptions, defaultOptions } from '../util/Options.js';
import { FunctionList } from '../util/FunctionList.js';
export class AbstractInputJax {
    constructor(options = {}) {
        this.adaptor = null;
        this.mmlFactory = null;
        const CLASS = this.constructor;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.preFilters = new FunctionList(this.options.preFilters);
        this.postFilters = new FunctionList(this.options.postFilters);
    }
    get name() {
        return this.constructor.NAME;
    }
    setAdaptor(adaptor) {
        this.adaptor = adaptor;
    }
    setMmlFactory(mmlFactory) {
        this.mmlFactory = mmlFactory;
    }
    initialize() { }
    reset(..._args) { }
    get processStrings() {
        return true;
    }
    findMath(_node, _options) {
        return [];
    }
    executeFilters(filters, math, document, data) {
        const args = { math: math, document: document, data: data };
        filters.execute(args);
        return args.data;
    }
}
AbstractInputJax.NAME = 'generic';
AbstractInputJax.OPTIONS = {
    preFilters: [],
    postFilters: [],
};
//# sourceMappingURL=InputJax.js.map