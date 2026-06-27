export class AbstractFactory {
    constructor(nodes = null) {
        this.defaultKind = 'unknown';
        this.nodeMap = new Map();
        this.node = {};
        if (nodes === null) {
            nodes = this.constructor.defaultNodes;
        }
        for (const kind of Object.keys(nodes)) {
            this.setNodeClass(kind, nodes[kind]);
        }
    }
    create(kind, ...args) {
        return (this.node[kind] || this.node[this.defaultKind])(...args);
    }
    setNodeClass(kind, nodeClass) {
        this.nodeMap.set(kind, nodeClass);
        const KIND = this.nodeMap.get(kind);
        this.node[kind] = (...args) => {
            return new KIND(this, ...args);
        };
    }
    getNodeClass(kind) {
        return this.nodeMap.get(kind);
    }
    deleteNodeClass(kind) {
        this.nodeMap.delete(kind);
        delete this.node[kind];
    }
    nodeIsKind(node, kind) {
        return node instanceof this.getNodeClass(kind);
    }
    getKinds() {
        return Array.from(this.nodeMap.keys());
    }
}
AbstractFactory.defaultNodes = {};
//# sourceMappingURL=Factory.js.map