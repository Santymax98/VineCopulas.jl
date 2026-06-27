var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractDOMAdaptor, } from '../core/DOMAdaptor.js';
export class HTMLAdaptor extends AbstractDOMAdaptor {
    constructor(window) {
        super(window.document);
        this.canMeasureNodes = true;
        this.window = window;
        this.parser = new window.DOMParser();
    }
    parse(text, format = 'text/html') {
        return this.parser.parseFromString(text, format);
    }
    create(kind, ns) {
        return ns
            ? this.document.createElementNS(ns, kind)
            : this.document.createElement(kind);
    }
    text(text) {
        return this.document.createTextNode(text);
    }
    head(doc = this.document) {
        return doc.head || doc;
    }
    body(doc = this.document) {
        return doc.body || doc;
    }
    root(doc = this.document) {
        return doc.documentElement || doc;
    }
    doctype(doc = this.document) {
        return doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : '';
    }
    tags(node, name, ns = null) {
        const nodes = ns
            ? node.getElementsByTagNameNS(ns, name)
            : node.getElementsByTagName(name);
        return Array.from(nodes);
    }
    getElements(nodes, _document) {
        let containers = [];
        for (const node of nodes) {
            if (typeof node === 'string') {
                containers = containers.concat(Array.from(this.document.querySelectorAll(node)));
            }
            else if (Array.isArray(node)) {
                containers = containers.concat(Array.from(node));
            }
            else if (node instanceof this.window.NodeList ||
                node instanceof this.window.HTMLCollection) {
                containers = containers.concat(Array.from(node));
            }
            else {
                containers.push(node);
            }
        }
        return containers;
    }
    getElement(selector, node = this.document) {
        return node.querySelector(selector);
    }
    contains(container, node) {
        return container.contains(node);
    }
    parent(node) {
        return node.parentNode;
    }
    append(node, child) {
        return node.appendChild(child);
    }
    insert(nchild, ochild) {
        return this.parent(ochild).insertBefore(nchild, ochild);
    }
    remove(child) {
        return this.parent(child).removeChild(child);
    }
    replace(nnode, onode) {
        return this.parent(onode).replaceChild(nnode, onode);
    }
    clone(node, deep = true) {
        return node.cloneNode(deep);
    }
    split(node, n) {
        return node.splitText(n);
    }
    next(node) {
        return node.nextSibling;
    }
    previous(node) {
        return node.previousSibling;
    }
    firstChild(node) {
        return node.firstChild;
    }
    lastChild(node) {
        return node.lastChild;
    }
    childNodes(node) {
        return Array.from(node.childNodes);
    }
    childNode(node, i) {
        return node.childNodes[i];
    }
    kind(node) {
        const n = node.nodeType;
        return n === 1 || n === 3 || n === 8 ? node.nodeName.toLowerCase() : '';
    }
    value(node) {
        return node.nodeValue || '';
    }
    textContent(node) {
        return node.textContent;
    }
    innerHTML(node) {
        return node.innerHTML;
    }
    outerHTML(node) {
        return node.outerHTML;
    }
    serializeXML(node) {
        const serializer = new this.window.XMLSerializer();
        return serializer.serializeToString(node);
    }
    setAttribute(node, name, value, ns = null) {
        if (!ns) {
            if (name === 'style') {
                value = value.replace(/\n/g, ' ');
            }
            return node.setAttribute(name, value);
        }
        name = ns.replace(/.*\//, '') + ':' + name.replace(/^.*:/, '');
        return node.setAttributeNS(ns, name, value);
    }
    getAttribute(node, name) {
        return node.getAttribute(name);
    }
    removeAttribute(node, name) {
        return node.removeAttribute(name);
    }
    hasAttribute(node, name) {
        return node.hasAttribute(name);
    }
    allAttributes(node) {
        return Array.from(node.attributes).map((x) => {
            return { name: x.name, value: x.value };
        });
    }
    addClass(node, name) {
        if (node.classList) {
            node.classList.add(name);
        }
        else {
            node.className = (node.className + ' ' + name).trim();
        }
    }
    removeClass(node, name) {
        if (node.classList) {
            node.classList.remove(name);
        }
        else {
            node.className = node.className
                .split(/ /)
                .filter((c) => c !== name)
                .join(' ');
        }
    }
    hasClass(node, name) {
        if (node.classList) {
            return node.classList.contains(name);
        }
        return node.className.split(/ /).includes(name);
    }
    setStyle(node, name, value) {
        node.style[name] = String(value).replace(/\n/g, ' ');
    }
    getStyle(node, name) {
        return node.style[name];
    }
    allStyles(node) {
        return node.style.cssText;
    }
    insertRules(node, rules) {
        for (const rule of rules) {
            try {
                node.sheet.insertRule(rule, node.sheet.cssRules.length);
            }
            catch (e) {
                console.warn(`MathJax: can't insert css rule '${rule}': ${e.message}`);
            }
        }
    }
    cssText(node) {
        if (this.kind(node) !== 'style') {
            return '';
        }
        return Array.from(node.sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
    }
    fontSize(node) {
        const style = this.window.getComputedStyle(node);
        return parseFloat(style.fontSize ||
            String(this.constructor.DEFAULT_FONT_SIZE));
    }
    fontFamily(node) {
        const style = this.window.getComputedStyle(node);
        return style.fontFamily || '';
    }
    nodeSize(node, em = 1, local = false) {
        if (local && node.getBBox) {
            const { width, height } = node.getBBox();
            return [width / em, height / em];
        }
        return [node.offsetWidth / em, node.offsetHeight / em];
    }
    nodeBBox(node) {
        const { left, right, top, bottom } = node.getBoundingClientRect();
        return { left, right, top, bottom };
    }
    createWorker(listener, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { path, maps, worker } = options;
            const file = `${path}/${worker}`;
            const content = `
      self.maps = '${quoted(maps)}';
      importScripts('${quoted(file)}');
    `;
            const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
            const webworker = new Worker(url);
            webworker.onmessage = listener;
            URL.revokeObjectURL(url);
            return webworker;
        });
    }
}
HTMLAdaptor.DEFAULT_FONT_SIZE = 16;
function quoted(text) {
    return [...text]
        .map((c) => {
        if (c === '\\' || c === "'") {
            c = '\\' + c;
        }
        else if (c < ' ' || c > '\u007e') {
            c = `\\u{${c.codePointAt(0).toString(16)}}`;
        }
        return c;
    })
        .join('');
}
//# sourceMappingURL=HTMLAdaptor.js.map