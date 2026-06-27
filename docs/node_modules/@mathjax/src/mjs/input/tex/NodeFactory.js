import NodeUtil from './NodeUtil.js';
export class NodeFactory {
    constructor() {
        this.mmlFactory = null;
        this.factory = {
            node: NodeFactory.createNode,
            token: NodeFactory.createToken,
            text: NodeFactory.createText,
            error: NodeFactory.createError,
        };
    }
    static createNode(factory, kind, children = [], def = {}, text) {
        const node = factory.mmlFactory.create(kind);
        node.setChildren(children);
        if (text) {
            node.appendChild(text);
        }
        NodeUtil.setProperties(node, def);
        return node;
    }
    static createToken(factory, kind, def = {}, text = '') {
        const textNode = factory.create('text', text);
        return factory.create('node', kind, [], def, textNode);
    }
    static createText(factory, text) {
        if (text == null) {
            return null;
        }
        return factory.mmlFactory.create('text').setText(text);
    }
    static createError(factory, message) {
        const text = factory.create('text', message);
        const mtext = factory.create('node', 'mtext', [], {}, text);
        const error = factory.create('node', 'merror', [mtext], {
            'data-mjx-error': message,
        });
        return error;
    }
    setMmlFactory(mmlFactory) {
        this.mmlFactory = mmlFactory;
    }
    set(kind, func) {
        this.factory[kind] = func;
    }
    setCreators(maps) {
        for (const kind in maps) {
            this.set(kind, maps[kind]);
        }
    }
    create(kind, ...rest) {
        const func = this.factory[kind] || this.factory['node'];
        const node = func(this, rest[0], ...rest.slice(1));
        if (kind === 'node') {
            this.configuration.addNode(rest[0], node);
        }
        return node;
    }
    get(kind) {
        return this.factory[kind];
    }
}
//# sourceMappingURL=NodeFactory.js.map