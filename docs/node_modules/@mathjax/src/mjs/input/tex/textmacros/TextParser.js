import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import { ParseUtil } from '../ParseUtil.js';
import { AbstractMmlNode } from '../../../core/MmlTree/MmlNode.js';
import NodeUtil from '../NodeUtil.js';
import { StopItem, StyleItem } from '../base/BaseItems.js';
export class TextParser extends TexParser {
    get texParser() {
        return this.configuration.packageData.get('textmacros').texParser;
    }
    get tags() {
        return this.texParser.tags;
    }
    constructor(text, env, configuration, level) {
        super(text, env, configuration);
        this.level = level;
    }
    mml() {
        this.copyLists();
        this.configuration.popParser();
        return this.level != null
            ? this.create('node', 'mstyle', this.nodes, {
                displaystyle: false,
                scriptlevel: this.level,
            })
            : this.nodes.length === 1
                ? this.nodes[0]
                : this.create('node', 'mrow', this.nodes);
    }
    copyLists() {
        const parseOptions = this.texParser.configuration;
        for (const [name, list] of Object.entries(this.configuration.nodeLists)) {
            for (const node of list) {
                parseOptions.addNode(name, node);
            }
        }
        this.configuration.nodeLists = {};
    }
    Parse() {
        this.text = '';
        this.nodes = [];
        this.envStack = [];
        super.Parse();
    }
    saveText() {
        if (this.text) {
            const mathvariant = this.stack.env.mathvariant;
            const text = ParseUtil.internalText(this, this.text, mathvariant ? { mathvariant } : {});
            this.text = '';
            this.Push(text);
        }
    }
    Push(mml) {
        if (this.text) {
            this.saveText();
        }
        if (mml instanceof StopItem) {
            return super.Push(mml);
        }
        if (mml instanceof StyleItem) {
            this.stack.env.mathcolor = this.stack.env.color;
            return;
        }
        if (mml instanceof AbstractMmlNode) {
            this.addAttributes(mml);
            this.nodes.push(mml);
        }
    }
    PushMath(mml) {
        const env = this.stack.env;
        for (const name of ['mathsize', 'mathcolor']) {
            if (env[name] && !mml.attributes.hasExplicit(name)) {
                if (!mml.isToken && !mml.isKind('mstyle')) {
                    mml = this.create('node', 'mstyle', [mml]);
                }
                NodeUtil.setAttribute(mml, name, env[name]);
            }
        }
        if (mml.isInferred) {
            mml = this.create('node', 'mrow', mml.childNodes);
        }
        if (!mml.isKind('TeXAtom')) {
            mml = this.create('node', 'TeXAtom', [mml]);
        }
        this.nodes.push(mml);
    }
    addAttributes(mml) {
        const env = this.stack.env;
        if (!mml.isToken)
            return;
        for (const name of ['mathsize', 'mathcolor', 'mathvariant']) {
            if (env[name] && !mml.attributes.hasExplicit(name)) {
                NodeUtil.setAttribute(mml, name, env[name]);
            }
        }
    }
    ParseTextArg(name, env) {
        const text = this.GetArgument(name);
        env = Object.assign(Object.assign({}, this.stack.env), env);
        return new TextParser(text, env, this.configuration).mml();
    }
    ParseArg(name) {
        return new TextParser(this.GetArgument(name), this.stack.env, this.configuration).mml();
    }
    Error(id, message, ...args) {
        throw new TexError(id, message, ...args);
    }
}
//# sourceMappingURL=TextParser.js.map