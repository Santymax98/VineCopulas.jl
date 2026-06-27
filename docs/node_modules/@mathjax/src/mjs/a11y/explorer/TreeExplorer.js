import { AbstractExplorer } from './Explorer.js';
export class AbstractTreeExplorer extends AbstractExplorer {
    constructor(document, pool, region, node, mml) {
        super(document, pool, null, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.mml = mml;
        this.stoppable = false;
    }
    Attach() {
        super.Attach();
        this.Start();
    }
    Detach() {
        this.Stop();
        super.Detach();
    }
}
export class FlameColorer extends AbstractTreeExplorer {
    Start() {
        if (this.active)
            return;
        this.active = true;
        this.highlighter.highlightAll(this.node);
    }
    Stop() {
        if (this.active) {
            this.highlighter.unhighlightAll();
        }
        this.active = false;
    }
}
export class TreeColorer extends AbstractTreeExplorer {
    constructor() {
        super(...arguments);
        this.contrast = new ContrastPicker();
        this.leaves = [];
        this.modality = 'data-semantic-foreground';
    }
    Start() {
        if (this.active)
            return;
        this.active = true;
        if (!this.node.hasAttribute('hasforegroundcolor')) {
            this.colorLeaves();
            this.node.setAttribute('hasforegroundcolor', 'true');
        }
        this.leaves.forEach((leaf) => this.colorize(leaf));
    }
    Stop() {
        if (this.active) {
            this.leaves.forEach((leaf) => this.uncolorize(leaf));
        }
        this.active = false;
    }
    colorLeaves() {
        this.leaves = Array.from(this.node.querySelectorAll('[data-semantic-id]:not([data-semantic-children])'));
        for (const leaf of this.leaves) {
            leaf.setAttribute(this.modality, this.contrast.generate());
            this.contrast.increment();
        }
    }
    colorize(node) {
        if (node.hasAttribute(this.modality)) {
            node.setAttribute(this.modality + '-old', node.style.color);
            node.style.color = node.getAttribute(this.modality);
        }
    }
    uncolorize(node) {
        const fore = this.modality + '-old';
        if (node.hasAttribute(fore)) {
            node.style.color = node.getAttribute(fore);
        }
    }
}
export class ContrastPicker {
    constructor() {
        this.hue = 10;
        this.sat = 100;
        this.light = 50;
        this.incr = 53;
    }
    generate() {
        return ContrastPicker.hsl2rgb(this.hue, this.sat, this.light);
    }
    increment() {
        this.hue = (this.hue + this.incr) % 360;
    }
    static hsl2rgb(h, s, l) {
        s = s > 1 ? s / 100 : s;
        l = l > 1 ? l / 100 : l;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            [r, g, b] = [c, x, 0];
        }
        else if (60 <= h && h < 120) {
            [r, g, b] = [x, c, 0];
        }
        else if (120 <= h && h < 180) {
            [r, g, b] = [0, c, x];
        }
        else if (180 <= h && h < 240) {
            [r, g, b] = [0, x, c];
        }
        else if (240 <= h && h < 300) {
            [r, g, b] = [x, 0, c];
        }
        else if (300 <= h && h < 360) {
            [r, g, b] = [c, 0, x];
        }
        return `rgb(${(r + m) * 255}, ${(g + m) * 255}, ${(b + m) * 255})`;
    }
}
//# sourceMappingURL=TreeExplorer.js.map