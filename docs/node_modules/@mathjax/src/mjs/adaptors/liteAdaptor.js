var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractDOMAdaptor } from '../core/DOMAdaptor.js';
import { NodeMixin } from './NodeMixin.js';
import { LiteDocument } from './lite/Document.js';
import { LiteElement } from './lite/Element.js';
import { LiteText, LiteComment } from './lite/Text.js';
import { LiteWindow } from './lite/Window.js';
import { LiteParser } from './lite/Parser.js';
import { Styles } from '../util/Styles.js';
export class LiteBase extends AbstractDOMAdaptor {
    constructor() {
        super();
        this.parser = new LiteParser();
        this.window = new LiteWindow();
    }
    parse(text, format) {
        return this.parser.parseFromString(text, format, this);
    }
    create(kind, _ns = null) {
        return new LiteElement(kind);
    }
    text(text) {
        return new LiteText(text);
    }
    comment(text) {
        return new LiteComment(text);
    }
    createDocument() {
        return new LiteDocument();
    }
    head(doc = this.document) {
        return doc.head;
    }
    body(doc = this.document) {
        return doc.body;
    }
    root(doc = this.document) {
        return doc.root;
    }
    doctype(doc = this.document) {
        return doc.type;
    }
    tags(node, name, ns = null, stop = null) {
        let stack = [];
        const tags = [];
        if (ns) {
            return tags;
        }
        let n = node;
        while (n) {
            const kind = n.kind;
            if (kind !== '#text' && kind !== '#comment') {
                n = n;
                if (kind === name) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    }
    elementById(node, id) {
        let stack = [];
        let n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                if (n.attributes['id'] === id) {
                    return n;
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return null;
    }
    elementsByClass(node, name, stop = null) {
        let stack = [];
        const tags = [];
        let n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                const classes = (n.attributes['class'] || '').trim().split(/ +/);
                if (classes.includes(name)) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    }
    elementsByAttribute(node, name, value, stop = null) {
        let stack = [];
        const tags = [];
        let n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                const attribute = n.attributes[name];
                if (attribute === value) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    }
    getElements(nodes, document) {
        let containers = [];
        const body = this.body(document);
        for (const node of nodes) {
            if (typeof node === 'string') {
                if (node.charAt(0) === '#') {
                    const n = this.elementById(body, node.slice(1));
                    if (n) {
                        containers.push(n);
                    }
                }
                else if (node.charAt(0) === '.') {
                    containers = containers.concat(this.elementsByClass(body, node.slice(1)));
                }
                else if (node.match(/^[-a-z][-a-z0-9]*$/i)) {
                    containers = containers.concat(this.tags(body, node));
                }
                else {
                    const match = node.match(/^\[(.*?)="(.*?)"\]$/);
                    if (match) {
                        containers = containers.concat(this.elementsByAttribute(body, match[1], match[2]));
                    }
                }
            }
            else if (Array.isArray(node)) {
                containers = containers.concat(node);
            }
            else if (node instanceof this.window.NodeList ||
                node instanceof this.window.HTMLCollection) {
                containers = containers.concat(node.nodes);
            }
            else {
                containers.push(node);
            }
        }
        return containers;
    }
    getElement(selector, node = this.document) {
        if (node instanceof LiteDocument) {
            node = this.body(node);
        }
        if (selector.charAt(0) === '#') {
            return this.elementById(node, selector.slice(1));
        }
        if (selector.charAt(0) === '.') {
            return this.elementsByClass(node, selector.slice(1), 1)[0];
        }
        if (selector.match(/^[-a-z][-a-z0-9]*$/i)) {
            return this.tags(node, selector, null, 1)[0];
        }
        const match = selector.match(/^\[(.*?)="(.*?)"\]$/);
        if (match) {
            return this.elementsByAttribute(node, match[1], match[2], 1)[0];
        }
        return null;
    }
    contains(container, node) {
        while (node && node !== container) {
            node = this.parent(node);
        }
        return !!node;
    }
    parent(node) {
        return node.parent;
    }
    childIndex(node) {
        return node.parent ? node.parent.children.findIndex((n) => n === node) : -1;
    }
    append(node, child) {
        if (child.parent) {
            this.remove(child);
        }
        node.children.push(child);
        child.parent = node;
        return child;
    }
    insert(nchild, ochild) {
        if (nchild.parent) {
            this.remove(nchild);
        }
        if (ochild && ochild.parent) {
            const i = this.childIndex(ochild);
            ochild.parent.children.splice(i, 0, nchild);
            nchild.parent = ochild.parent;
        }
    }
    remove(child) {
        const i = this.childIndex(child);
        if (i >= 0) {
            child.parent.children.splice(i, 1);
        }
        child.parent = null;
        return child;
    }
    replace(nnode, onode) {
        const i = this.childIndex(onode);
        if (i >= 0) {
            onode.parent.children[i] = nnode;
            nnode.parent = onode.parent;
            onode.parent = null;
        }
        return onode;
    }
    clone(node, deep = true) {
        const nnode = new LiteElement(node.kind);
        nnode.attributes = Object.assign({}, node.attributes);
        nnode.children = !deep
            ? []
            : node.children.map((n) => {
                if (n.kind === '#text') {
                    return new LiteText(n.value);
                }
                else if (n.kind === '#comment') {
                    return new LiteComment(n.value);
                }
                else {
                    const m = this.clone(n);
                    m.parent = nnode;
                    return m;
                }
            });
        return nnode;
    }
    split(node, n) {
        const text = new LiteText(node.value.slice(n));
        node.value = node.value.slice(0, n);
        node.parent.children.splice(this.childIndex(node) + 1, 0, text);
        text.parent = node.parent;
        return text;
    }
    next(node) {
        const parent = node.parent;
        if (!parent)
            return null;
        const i = this.childIndex(node) + 1;
        return i >= 0 && i < parent.children.length ? parent.children[i] : null;
    }
    previous(node) {
        const parent = node.parent;
        if (!parent)
            return null;
        const i = this.childIndex(node) - 1;
        return i >= 0 ? parent.children[i] : null;
    }
    firstChild(node) {
        return node.children[0];
    }
    lastChild(node) {
        return node.children[node.children.length - 1];
    }
    childNodes(node) {
        return [...node.children];
    }
    childNode(node, i) {
        return node.children[i];
    }
    kind(node) {
        return node.kind;
    }
    value(node) {
        return node.kind === '#text'
            ? node.value
            : node.kind === '#comment'
                ? node.value.replace(/^<!(--)?((?:.|\n)*)\1>$/, '$2')
                : '';
    }
    textContent(node) {
        return node.children.reduce((s, n) => {
            return (s +
                (n.kind === '#text'
                    ? n.value
                    : n.kind === '#comment'
                        ? ''
                        : this.textContent(n)));
        }, '');
    }
    innerHTML(node) {
        return this.parser.serializeInner(this, node);
    }
    outerHTML(node) {
        return this.parser.serialize(this, node);
    }
    serializeXML(node) {
        return this.parser.serialize(this, node, true);
    }
    setAttribute(node, name, value, ns = null) {
        if (typeof value !== 'string') {
            value = String(value);
        }
        if (ns) {
            name = ns.replace(/.*\//, '') + ':' + name.replace(/^.*:/, '');
        }
        node.attributes[name] = value;
        if (name === 'style') {
            node.styles = null;
        }
    }
    getAttribute(node, name) {
        return node.attributes[name];
    }
    removeAttribute(node, name) {
        delete node.attributes[name];
    }
    hasAttribute(node, name) {
        return Object.hasOwn(node.attributes, name);
    }
    allAttributes(node) {
        const attributes = node.attributes;
        const list = [];
        for (const name of Object.keys(attributes)) {
            list.push({ name: name, value: attributes[name] });
        }
        return list;
    }
    addClass(node, name) {
        const classString = node.attributes['class'];
        const classes = (classString === null || classString === void 0 ? void 0 : classString.split(/ /)) || [];
        if (!classes.includes(name)) {
            classes.push(name);
            node.attributes['class'] = classes.join(' ');
        }
    }
    removeClass(node, name) {
        const classString = node.attributes['class'];
        const classes = (classString === null || classString === void 0 ? void 0 : classString.split(/ /)) || [];
        const i = classes.indexOf(name);
        if (i >= 0) {
            classes.splice(i, 1);
            node.attributes['class'] = classes.join(' ');
        }
    }
    hasClass(node, name) {
        const classes = (node.attributes['class'] || '').split(/ /);
        return classes.includes(name);
    }
    setStyle(node, name, value) {
        if (!node.styles) {
            node.styles = new Styles(this.getAttribute(node, 'style'));
        }
        node.styles.set(name, value);
        node.attributes['style'] = node.styles.cssText;
    }
    getStyle(node, name) {
        if (!node.styles) {
            const style = this.getAttribute(node, 'style');
            if (!style) {
                return '';
            }
            node.styles = new Styles(style);
        }
        return node.styles.get(name);
    }
    allStyles(node) {
        return this.getAttribute(node, 'style');
    }
    insertRules(node, rules) {
        node.children = [
            this.text(this.textContent(node) + '\n\n' + rules.join('\n\n')),
        ];
    }
    fontSize(_node) {
        return 0;
    }
    fontFamily(_node) {
        return '';
    }
    nodeSize(_node, _em = 1, _local = null) {
        return [0, 0];
    }
    nodeBBox(_node) {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    createWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
}
export class LiteAdaptor extends NodeMixin(LiteBase) {
}
export function liteAdaptor(options = null) {
    return new LiteAdaptor(null, options);
}
//# sourceMappingURL=liteAdaptor.js.map