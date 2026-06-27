import StackItemFactory from './StackItemFactory.js';
import { NodeFactory } from './NodeFactory.js';
import NodeUtil from './NodeUtil.js';
import { TexConstant } from './TexConstants.js';
import { defaultOptions } from '../../util/Options.js';
import { ColumnParser } from './ColumnParser.js';
const MATHVARIANT = TexConstant.Variant;
class ParseOptions {
    constructor(configuration, options = []) {
        this.options = {};
        this.columnParser = new ColumnParser();
        this.packageData = new Map();
        this.parsers = [];
        this.root = null;
        this.nodeLists = {};
        this.error = false;
        this.handlers = configuration.handlers;
        this.nodeFactory = new NodeFactory();
        this.nodeFactory.configuration = this;
        this.nodeFactory.setCreators(configuration.nodes);
        this.itemFactory = new StackItemFactory(configuration.items);
        this.itemFactory.configuration = this;
        defaultOptions(this.options, ...options);
        defaultOptions(this.options, configuration.options);
        this.mathStyle =
            ParseOptions.getVariant.get(this.options.mathStyle) ||
                ParseOptions.getVariant.get('TeX');
    }
    pushParser(parser) {
        this.parsers.unshift(parser);
    }
    popParser() {
        this.parsers.shift();
    }
    get parser() {
        return this.parsers[0];
    }
    clear() {
        this.parsers = [];
        this.root = null;
        this.nodeLists = {};
        this.error = false;
        this.tags.resetTag();
    }
    addNode(property, node) {
        let list = this.nodeLists[property];
        if (!list) {
            list = this.nodeLists[property] = [];
        }
        list.push(node);
        if (node.kind !== property) {
            const inlists = NodeUtil.getProperty(node, 'in-lists') || '';
            const lists = (inlists ? inlists.split(/,/) : [])
                .concat(property)
                .join(',');
            NodeUtil.setProperty(node, 'in-lists', lists);
        }
    }
    getList(property) {
        const list = this.nodeLists[property] || [];
        const result = [];
        for (const node of list) {
            if (this.inTree(node)) {
                result.push(node);
            }
        }
        this.nodeLists[property] = result;
        return result;
    }
    removeFromList(property, nodes) {
        const list = this.nodeLists[property] || [];
        for (const node of nodes) {
            const i = list.indexOf(node);
            if (i >= 0) {
                list.splice(i, 1);
            }
        }
    }
    inTree(node) {
        while (node && node !== this.root) {
            node = node.parent;
        }
        return !!node;
    }
}
ParseOptions.getVariant = new Map([
    [
        'TeX',
        (c, b) => b ? (c.match(/^[\u0391-\u03A9\u03F4]/) ? MATHVARIANT.NORMAL : '') : '',
    ],
    ['ISO', (_c) => MATHVARIANT.ITALIC],
    [
        'French',
        (c) => c.normalize('NFD').match(/^[a-z]/)
            ? MATHVARIANT.ITALIC
            : MATHVARIANT.NORMAL,
    ],
    ['upright', (_c) => MATHVARIANT.NORMAL],
]);
export default ParseOptions;
//# sourceMappingURL=ParseOptions.js.map