export class AbstractNode {
    constructor(factory, properties = {}, children = []) {
        this.factory = factory;
        this.parent = null;
        this.properties = {};
        this.childNodes = [];
        for (const name of Object.keys(properties)) {
            this.setProperty(name, properties[name]);
        }
        if (children.length) {
            this.setChildren(children);
        }
    }
    get kind() {
        return 'unknown';
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
    getAllProperties() {
        return this.properties;
    }
    removeProperty(...names) {
        for (const name of names) {
            delete this.properties[name];
        }
    }
    isKind(kind) {
        return this.factory.nodeIsKind(this, kind);
    }
    setChildren(children) {
        this.childNodes = [];
        for (const child of children) {
            this.appendChild(child);
        }
    }
    appendChild(child) {
        this.childNodes.push(child);
        child.parent = this;
        return child;
    }
    replaceChild(newChild, oldChild) {
        const i = this.childIndex(oldChild);
        if (i !== null) {
            this.childNodes[i] = newChild;
            newChild.parent = this;
            if (oldChild.parent === this) {
                oldChild.parent = null;
            }
        }
        return newChild;
    }
    removeChild(child) {
        const i = this.childIndex(child);
        if (i !== null) {
            this.childNodes.splice(i, 1);
            child.parent = null;
        }
        return child;
    }
    childIndex(node) {
        const i = this.childNodes.indexOf(node);
        return i === -1 ? null : i;
    }
    copy() {
        const node = this.factory.create(this.kind);
        node.properties = Object.assign({}, this.properties);
        for (const child of this.childNodes || []) {
            if (child) {
                node.appendChild(child.copy());
            }
        }
        return node;
    }
    findNodes(kind) {
        const nodes = [];
        this.walkTree((node) => {
            if (node.isKind(kind)) {
                nodes.push(node);
            }
        });
        return nodes;
    }
    walkTree(func, data) {
        func(this, data);
        for (const child of this.childNodes) {
            if (child) {
                child.walkTree(func, data);
            }
        }
        return data;
    }
    toString() {
        return this.kind + '(' + this.childNodes.join(',') + ')';
    }
}
export class AbstractEmptyNode extends AbstractNode {
    setChildren(_children) { }
    appendChild(child) {
        return child;
    }
    replaceChild(_newChild, oldChild) {
        return oldChild;
    }
    childIndex(_node) {
        return null;
    }
    walkTree(func, data) {
        func(this, data);
        return data;
    }
    toString() {
        return this.kind;
    }
}
//# sourceMappingURL=Node.js.map