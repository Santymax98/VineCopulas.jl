export class AbstractWrapper {
    get kind() {
        return this.node.kind;
    }
    constructor(factory, node) {
        this.factory = factory;
        this.node = node;
    }
    wrap(node) {
        return this.factory.wrap(node);
    }
    walkTree(func, data) {
        func(this, data);
        if ('childNodes' in this) {
            for (const child of this.childNodes) {
                if (child) {
                    child.walkTree(func, data);
                }
            }
        }
        return data;
    }
}
//# sourceMappingURL=Wrapper.js.map