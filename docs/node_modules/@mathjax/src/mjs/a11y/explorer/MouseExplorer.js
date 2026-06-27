import { DummyRegion } from './Region.js';
import { AbstractExplorer } from './Explorer.js';
import '../sre.js';
export class AbstractMouseExplorer extends AbstractExplorer {
    constructor() {
        super(...arguments);
        this.events = super.Events().concat([
            ['mouseover', this.MouseOver.bind(this)],
            ['mouseout', this.MouseOut.bind(this)],
        ]);
    }
    MouseOver(_event) {
        this.Start();
    }
    MouseOut(_event) {
        this.Stop();
    }
}
export class Hoverer extends AbstractMouseExplorer {
    constructor(document, pool, region, node, nodeQuery, nodeAccess) {
        super(document, pool, region, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.nodeQuery = nodeQuery;
        this.nodeAccess = nodeAccess;
    }
    MouseOut(event) {
        this.highlighter.unhighlight();
        this.region.Hide();
        super.MouseOut(event);
    }
    MouseOver(event) {
        super.MouseOver(event);
        const target = event.target;
        const [node, kind] = this.getNode(target);
        if (!node) {
            return;
        }
        this.highlighter.unhighlight();
        this.highlighter.highlight([node]);
        this.region.Update(kind);
        this.region.Show(node);
    }
    getNode(node) {
        const original = node;
        while (node && node !== this.node) {
            if (this.nodeQuery(node)) {
                return [node, this.nodeAccess(node)];
            }
            node = node.parentNode;
        }
        node = original;
        while (node) {
            if (this.nodeQuery(node)) {
                return [node, this.nodeAccess(node)];
            }
            const child = node.childNodes[0];
            node =
                child && child.tagName === 'defs'
                    ? node.childNodes[1]
                    : child;
        }
        return [null, null];
    }
}
export class ValueHoverer extends Hoverer {
}
export class ContentHoverer extends Hoverer {
}
export class FlameHoverer extends Hoverer {
    constructor(document, pool, _ignore, node) {
        super(document, pool, new DummyRegion(document), node, (x) => this.highlighter.isMactionNode(x), () => { });
        this.document = document;
        this.pool = pool;
        this.node = node;
    }
}
//# sourceMappingURL=MouseExplorer.js.map