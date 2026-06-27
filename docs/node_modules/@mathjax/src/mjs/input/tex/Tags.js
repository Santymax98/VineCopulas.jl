import TexParser from './TexParser.js';
export class Label {
    constructor(tag = '???', id = '') {
        this.tag = tag;
        this.id = id;
    }
}
export class TagInfo {
    constructor(env = '', taggable = false, defaultTags = false, tag = null, tagId = '', tagFormat = '', noTag = false, labelId = '') {
        this.env = env;
        this.taggable = taggable;
        this.defaultTags = defaultTags;
        this.tag = tag;
        this.tagId = tagId;
        this.tagFormat = tagFormat;
        this.noTag = noTag;
        this.labelId = labelId;
    }
}
export class AbstractTags {
    constructor() {
        this.counter = 0;
        this.allCounter = 0;
        this.configuration = null;
        this.ids = {};
        this.allIds = {};
        this.labels = {};
        this.allLabels = {};
        this.redo = false;
        this.refUpdate = false;
        this.currentTag = new TagInfo();
        this.history = [];
        this.stack = [];
        this.enTag = function (node, tag) {
            const nf = this.configuration.nodeFactory;
            const cell = nf.create('node', 'mtd', [node]);
            const row = nf.create('node', 'mlabeledtr', [tag, cell]);
            const table = nf.create('node', 'mtable', [row], {
                side: this.configuration.options['tagSide'],
                minlabelspacing: this.configuration.options['tagIndent'],
                displaystyle: true,
            });
            return table;
        };
    }
    start(env, taggable, defaultTags) {
        if (this.currentTag) {
            this.stack.push(this.currentTag);
        }
        const label = this.label;
        this.currentTag = new TagInfo(env, taggable, defaultTags);
        this.label = label;
    }
    get env() {
        return this.currentTag.env;
    }
    end() {
        this.history.push(this.currentTag);
        const label = this.label;
        this.currentTag = this.stack.pop();
        if (label && !this.label) {
            this.label = label;
        }
    }
    tag(tag, noFormat) {
        this.currentTag.tag = tag;
        this.currentTag.tagFormat = noFormat ? tag : this.formatTag(tag);
        this.currentTag.noTag = false;
    }
    notag() {
        this.tag('', true);
        this.currentTag.noTag = true;
    }
    get noTag() {
        return this.currentTag.noTag;
    }
    set label(label) {
        this.currentTag.labelId = label;
    }
    get label() {
        return this.currentTag.labelId;
    }
    formatUrl(id, base) {
        return base + '#' + encodeURIComponent(id);
    }
    formatTag(tag) {
        return ['(', tag, ')'];
    }
    formatRef(tag) {
        return this.formatTag(tag);
    }
    formatId(id) {
        return 'mjx-eqn:' + id.replace(/\s/g, '_');
    }
    formatNumber(n) {
        return n.toString();
    }
    autoTag() {
        if (this.currentTag.tag == null) {
            this.counter++;
            this.tag(this.formatNumber(this.counter), false);
        }
    }
    clearTag() {
        this.tag(null, true);
        this.currentTag.tagId = '';
    }
    getTag(force = false) {
        if (force) {
            this.autoTag();
            return this.makeTag();
        }
        const ct = this.currentTag;
        if (ct.taggable && !ct.noTag) {
            if (ct.defaultTags) {
                this.autoTag();
            }
            if (ct.tag) {
                return this.makeTag();
            }
        }
        return null;
    }
    resetTag() {
        this.history = [];
        this.redo = false;
        this.refUpdate = false;
        this.clearTag();
    }
    reset(offset = 0) {
        this.resetTag();
        this.counter = this.allCounter = offset;
        this.allLabels = {};
        this.allIds = {};
        this.label = '';
    }
    startEquation(math) {
        this.history = [];
        this.stack = [];
        this.clearTag();
        this.currentTag = new TagInfo('', undefined, undefined);
        this.labels = {};
        this.ids = {};
        this.counter = this.allCounter;
        this.redo = false;
        const recompile = math.inputData.recompile;
        if (recompile) {
            this.refUpdate = true;
            this.counter = recompile.counter;
        }
    }
    finishEquation(math) {
        if (this.redo) {
            math.inputData.recompile = {
                state: math.state(),
                counter: this.allCounter,
            };
        }
        if (!this.refUpdate) {
            this.allCounter = this.counter;
        }
        Object.assign(this.allIds, this.ids);
        Object.assign(this.allLabels, this.labels);
    }
    finalize(node, env) {
        if (!env.display || this.currentTag.env || this.currentTag.tag == null) {
            return node;
        }
        const tag = this.makeTag();
        const table = this.enTag(node, tag);
        return table;
    }
    makeId() {
        this.currentTag.tagId = this.formatId(this.configuration.options['useLabelIds']
            ? this.label || this.currentTag.tag
            : this.currentTag.tag);
    }
    makeTag() {
        var _a;
        this.makeId();
        if (this.label) {
            this.labels[this.label] = new Label(this.currentTag.tag, this.currentTag.tagId);
            this.label = '';
        }
        const format = this.currentTag.tagFormat;
        const tag = Array.isArray(format)
            ? format
            : ((_a = format.match(/^(\(|\[|\{)(.*)(\}|\]|\))$/)) === null || _a === void 0 ? void 0 : _a.slice(1)) || [format];
        const mml = new TexParser(tag.map((part) => (part ? `\\text{${part}}` : '')).join(''), {}, this.configuration).mml();
        return this.configuration.nodeFactory.create('node', 'mtd', [mml], {
            id: this.currentTag.tagId,
            rowalign: this.configuration.options.tagAlign,
        });
    }
}
export class NoTags extends AbstractTags {
    autoTag() { }
    getTag() {
        return !this.currentTag.tag ? null : super.getTag();
    }
}
export class AllTags extends AbstractTags {
    finalize(node, env) {
        if (!env.display ||
            this.history.find(function (x) {
                return x.taggable;
            })) {
            return node;
        }
        const tag = this.getTag(true);
        return this.enTag(node, tag);
    }
}
const tagsMapping = new Map([
    ['none', NoTags],
    ['all', AllTags],
]);
let defaultTags = 'none';
export const TagsFactory = {
    OPTIONS: {
        tags: defaultTags,
        tagSide: 'right',
        tagIndent: '0.8em',
        useLabelIds: true,
        ignoreDuplicateLabels: false,
        tagAlign: 'baseline',
    },
    add(name, constr) {
        tagsMapping.set(name, constr);
    },
    addTags(tags) {
        for (const key of Object.keys(tags)) {
            TagsFactory.add(key, tags[key]);
        }
    },
    create(name) {
        const constr = tagsMapping.get(name) || tagsMapping.get(defaultTags);
        if (!constr) {
            throw Error('Unknown tags class');
        }
        return new constr();
    },
    setDefault(name) {
        defaultTags = name;
    },
    getDefault() {
        return TagsFactory.create(defaultTags);
    },
};
//# sourceMappingURL=Tags.js.map