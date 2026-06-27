export class AbstractDOMAdaptor {
    constructor(document = null) {
        this.canMeasureNodes = true;
        this.document = document;
    }
    node(kind, def = {}, children = [], ns) {
        const node = this.create(kind, ns);
        this.setAttributes(node, def);
        for (const child of children) {
            this.append(node, child);
        }
        return node;
    }
    setProperty(node, name, value) {
        node[name] = value;
    }
    getProperty(node, name) {
        return node[name];
    }
    setAttributes(node, def) {
        if (def.style && typeof def.style !== 'string') {
            for (const key of Object.keys(def.style)) {
                this.setStyle(node, key.replace(/-([a-z])/g, (_m, c) => c.toUpperCase()), def.style[key]);
            }
        }
        if (def.properties) {
            for (const key of Object.keys(def.properties)) {
                node[key] = def.properties[key];
            }
        }
        for (const key of Object.keys(def)) {
            if ((key !== 'style' || typeof def.style === 'string') &&
                key !== 'properties') {
                this.setAttribute(node, key, def[key]);
            }
        }
    }
    replace(nnode, onode) {
        this.insert(nnode, onode);
        this.remove(onode);
        return onode;
    }
    childNode(node, i) {
        return this.childNodes(node)[i];
    }
    allClasses(node) {
        const classes = this.getAttribute(node, 'class');
        return !classes
            ? []
            : classes
                .replace(/  +/g, ' ')
                .replace(/^ /, '')
                .replace(/ $/, '')
                .split(/ /);
    }
    cssText(node) {
        return this.kind(node) === 'style' ? this.textContent(node) : '';
    }
}
//# sourceMappingURL=DOMAdaptor.js.map