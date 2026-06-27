import { AbstractInputJax } from '../core/InputJax.js';
import { defaultOptions, separateOptions, } from '../util/Options.js';
import { FunctionList } from '../util/FunctionList.js';
import { FindMathML } from './mathml/FindMathML.js';
import { MathMLCompile } from './mathml/MathMLCompile.js';
export class MathML extends AbstractInputJax {
    constructor(options = {}) {
        const [mml, find, compile] = separateOptions(options, FindMathML.OPTIONS, MathMLCompile.OPTIONS);
        super(mml);
        this.findMathML = this.options.FindMathML || new FindMathML(find);
        this.mathml =
            this.options.MathMLCompile || new MathMLCompile(compile);
        this.mmlFilters = new FunctionList(this.options.mmlFilters);
    }
    setAdaptor(adaptor) {
        super.setAdaptor(adaptor);
        this.findMathML.adaptor = adaptor;
        this.mathml.adaptor = adaptor;
    }
    setMmlFactory(mmlFactory) {
        super.setMmlFactory(mmlFactory);
        this.mathml.setMmlFactory(mmlFactory);
    }
    get processStrings() {
        return false;
    }
    compile(math, document) {
        let mml = math.start.node;
        if (!mml ||
            !math.end.node ||
            this.options['forceReparse'] ||
            this.adaptor.kind(mml) === '#text') {
            let mathml = this.executeFilters(this.preFilters, math, document, (math.math || '<math></math>').trim());
            if (this.options['parseAs'] === 'html') {
                mathml = `<html><head></head><body>${mathml}</body></html>`;
            }
            const doc = this.checkForErrors(this.adaptor.parse(mathml, 'text/' + this.options['parseAs']));
            const body = this.adaptor.body(doc);
            if (this.adaptor.childNodes(body).length !== 1) {
                this.error('MathML must consist of a single element');
            }
            mml = this.adaptor.remove(this.adaptor.firstChild(body));
            if (this.adaptor.kind(mml).replace(/^[a-z]+:/, '') !== 'math') {
                this.error('MathML must be formed by a <math> element, not <' +
                    this.adaptor.kind(mml) +
                    '>');
            }
        }
        mml = this.executeFilters(this.mmlFilters, math, document, mml);
        let root = this.mathml.compile(mml);
        root = this.executeFilters(this.postFilters, math, document, root);
        math.display = root.attributes.get('display') === 'block';
        return root;
    }
    checkForErrors(doc) {
        const err = this.adaptor.tags(this.adaptor.body(doc), 'parsererror')[0];
        if (err) {
            if (this.adaptor.textContent(err) === '') {
                this.error('Error processing MathML');
            }
            this.options['parseError'].call(this, err);
        }
        return doc;
    }
    error(message) {
        throw new Error(message);
    }
    findMath(node) {
        return this.findMathML.findMath(node);
    }
}
MathML.NAME = 'MathML';
MathML.OPTIONS = defaultOptions({
    parseAs: 'html',
    forceReparse: false,
    mmlFilters: [],
    FindMathML: null,
    MathMLCompile: null,
    parseError: function (node) {
        this.error(this.adaptor.textContent(node).replace(/\n.*/g, ''));
    }
}, AbstractInputJax.OPTIONS);
//# sourceMappingURL=mathml.js.map