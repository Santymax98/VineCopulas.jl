import { AbstractInputJax } from '../core/InputJax.js';
import { userOptions, separateOptions } from '../util/Options.js';
import { FindTeX } from './tex/FindTeX.js';
import FilterUtil from './tex/FilterUtil.js';
import NodeUtil from './tex/NodeUtil.js';
import TexParser from './tex/TexParser.js';
import TexError from './tex/TexError.js';
import ParseOptions from './tex/ParseOptions.js';
import { TagsFactory } from './tex/Tags.js';
import { ParserConfiguration } from './tex/Configuration.js';
import { TexConstant } from './tex/TexConstants.js';
import './tex/base/BaseConfiguration.js';
export class TeX extends AbstractInputJax {
    static configure(packages) {
        const configuration = new ParserConfiguration(packages, ['tex']);
        configuration.init();
        return configuration;
    }
    static tags(options, configuration) {
        TagsFactory.addTags(configuration.tags);
        TagsFactory.setDefault(options.options.tags);
        options.tags = TagsFactory.getDefault();
        options.tags.configuration = options;
    }
    constructor(options = {}) {
        const [rest, tex, find] = separateOptions(options, TeX.OPTIONS, FindTeX.OPTIONS);
        super(tex);
        this.findTeX = this.options['FindTeX'] || new FindTeX(find);
        const packages = this.options.packages;
        const configuration = (this.configuration = TeX.configure(packages));
        const parseOptions = (this._parseOptions = new ParseOptions(configuration, [
            this.options,
            TagsFactory.OPTIONS,
        ]));
        userOptions(parseOptions.options, rest);
        configuration.config(this);
        TeX.tags(parseOptions, configuration);
        this.postFilters.addList([
            [FilterUtil.cleanSubSup, -7],
            [FilterUtil.setInherited, -6],
            [FilterUtil.checkScriptlevel, -5],
            [FilterUtil.moveLimits, -4],
            [FilterUtil.cleanStretchy, -3],
            [FilterUtil.cleanAttributes, -2],
            [FilterUtil.combineRelations, -1],
        ]);
    }
    setMmlFactory(mmlFactory) {
        super.setMmlFactory(mmlFactory);
        this._parseOptions.nodeFactory.setMmlFactory(mmlFactory);
    }
    get parseOptions() {
        return this._parseOptions;
    }
    reset(tag = 0) {
        this.parseOptions.tags.reset(tag);
    }
    compile(math, document) {
        this.parseOptions.clear();
        this.parseOptions.mathItem = math;
        this.executeFilters(this.preFilters, math, document, this.parseOptions);
        this.latex = math.math;
        let node;
        this.parseOptions.tags.startEquation(math);
        let parser;
        try {
            parser = new TexParser(this.latex, { display: math.display, isInner: false }, this.parseOptions);
            node = parser.mml();
        }
        catch (err) {
            if (!(err instanceof TexError)) {
                throw err;
            }
            this.parseOptions.error = true;
            node = this.options.formatError(this, err);
        }
        node = this.parseOptions.nodeFactory.create('node', 'math', [node]);
        node.attributes.set(TexConstant.Attr.LATEX, this.latex);
        if (math.display) {
            NodeUtil.setAttribute(node, 'display', 'block');
        }
        this.parseOptions.tags.finishEquation(math);
        this.parseOptions.root = node;
        this.executeFilters(this.postFilters, math, document, this.parseOptions);
        if (parser && parser.stack.env.hsize) {
            NodeUtil.setAttribute(node, 'maxwidth', parser.stack.env.hsize);
            NodeUtil.setAttribute(node, 'overflow', 'linebreak');
        }
        this.mathNode = this.parseOptions.root;
        return this.mathNode;
    }
    findMath(strings) {
        return this.findTeX.findMath(strings);
    }
    formatError(err) {
        const message = err.message.replace(/\n.*/, '');
        return this.parseOptions.nodeFactory.create('error', message, err.id, this.latex);
    }
}
TeX.NAME = 'TeX';
TeX.OPTIONS = Object.assign(Object.assign({}, AbstractInputJax.OPTIONS), { FindTeX: null, packages: ['base'], maxBuffer: 5 * 1024, maxTemplateSubtitutions: 10000, mathStyle: 'TeX', formatError: (jax, err) => jax.formatError(err) });
//# sourceMappingURL=tex.js.map