import { LiveRegion } from './Region.js';
const DEFAULT_BACKGROUND = { color: 'blue', alpha: 0.2 };
const DEFAULT_FOREGROUND = { color: 'black', alpha: 1 };
export const ATTR = {
    ENCLOSED: 'data-sre-enclosed',
    BBOX: 'data-sre-highlighter-bbox',
    ADDED: 'data-sre-highlighter-added',
};
class AbstractHighlighter {
    constructor(priority) {
        this.currentHighlights = [];
        this.priority = priority;
        this.ATTR = 'data-sre-highlight-' + priority;
    }
    highlight(nodes) {
        this.currentHighlights.push(nodes);
        for (const node of nodes) {
            this.highlightNode(node);
            this.setHighlighted(node);
        }
    }
    highlightAll(node) {
        const mactions = this.getMactionNodes(node);
        for (const maction of mactions) {
            this.highlight([maction]);
        }
    }
    unhighlight() {
        const nodes = this.currentHighlights.pop();
        if (!nodes) {
            return;
        }
        nodes.forEach((node) => {
            if (this.isHighlighted(node)) {
                this.unhighlightNode(node);
                this.unsetHighlighted(node);
            }
        });
    }
    unhighlightAll() {
        while (this.currentHighlights.length > 0) {
            this.unhighlight();
        }
    }
    encloseNodes(parts, node) {
        if (parts.length === 1) {
            return parts;
        }
        const CLASS = this.constructor;
        const selector = CLASS.lineSelector;
        const lineno = CLASS.lineAttr;
        const lines = new Map();
        for (const part of parts) {
            const line = part.closest(selector);
            const n = line ? line.getAttribute(lineno) : '';
            if (!lines.has(n)) {
                lines.set(n, []);
            }
            lines.get(n).push(part);
        }
        for (const list of lines.values()) {
            if (list.length > 1) {
                let [L, T, R, B] = [Infinity, Infinity, -Infinity, -Infinity];
                for (const part of list) {
                    part.setAttribute(ATTR.ENCLOSED, 'true');
                    const { left, top, right, bottom } = part.getBoundingClientRect();
                    if (top === bottom && left === right)
                        continue;
                    if (left < L)
                        L = left;
                    if (top < T)
                        T = top;
                    if (bottom > B)
                        B = bottom;
                    if (right > R)
                        R = right;
                }
                const enclosure = this.createEnclosure(L, B, R - L, B - T, node, list[0]);
                parts.push(enclosure);
            }
        }
        return parts;
    }
    setColorCSS(type, color, def) {
        var _a, _b;
        const name = (_a = color.color) !== null && _a !== void 0 ? _a : def.color;
        const alpha = (_b = color.alpha) !== null && _b !== void 0 ? _b : def.alpha;
        LiveRegion.setColor(type, this.priority, name, alpha);
    }
    setColor(background, foreground) {
        this.setColorCSS('fg', foreground, DEFAULT_FOREGROUND);
        this.setColorCSS('bg', background, DEFAULT_BACKGROUND);
    }
    isHighlighted(node) {
        return node.hasAttribute(this.ATTR);
    }
    setHighlighted(node) {
        node.setAttribute(this.ATTR, 'true');
    }
    unsetHighlighted(node) {
        node.removeAttribute(this.ATTR);
        node.removeAttribute(ATTR.ENCLOSED);
    }
}
class SvgHighlighter extends AbstractHighlighter {
    highlightNode(node) {
        if (this.isHighlighted(node) ||
            node.tagName === 'svg' ||
            node.tagName === 'MJX-CONTAINER' ||
            node.hasAttribute(ATTR.BBOX) ||
            node.hasAttribute(ATTR.ENCLOSED)) {
            return;
        }
        const { x, y, width, height } = node.getBBox();
        const rect = this.createRect(x, y, width, height, node.getAttribute('transform'));
        this.setHighlighted(rect);
        node.parentNode.insertBefore(rect, node);
    }
    unhighlightNode(node) {
        if (node.hasAttribute(ATTR.BBOX)) {
            node.remove();
            return;
        }
        const previous = node.previousSibling;
        if (previous === null || previous === void 0 ? void 0 : previous.hasAttribute(ATTR.ADDED)) {
            previous.remove();
        }
    }
    createEnclosure(x, y, w, h, _node, part) {
        const [x1, y1] = this.screen2svg(x, y, part);
        const [x2, y2] = this.screen2svg(x + w, y - h, part);
        const rect = this.createRect(x1, y1, x2 - x1, y2 - y1, part.getAttribute('transform'));
        rect.setAttribute(ATTR.BBOX, 'true');
        part.parentNode.insertBefore(rect, part);
        return rect;
    }
    screen2svg(x, y, part) {
        const node = part;
        const P = DOMPoint.fromPoint({ x, y }).matrixTransform(node.getScreenCTM().inverse());
        return [P.x, P.y];
    }
    createRect(x, y, w, h, transform) {
        const padding = 40;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute(ATTR.ADDED, 'true');
        rect.setAttribute('x', String(x - padding));
        rect.setAttribute('y', String(y - padding));
        rect.setAttribute('width', String(w + 2 * padding));
        rect.setAttribute('height', String(h + 2 * padding));
        if (transform) {
            rect.setAttribute('transform', transform);
        }
        return rect;
    }
    isMactionNode(node) {
        return node.getAttribute('data-mml-node') === 'maction';
    }
    getMactionNodes(node) {
        return Array.from(node.querySelectorAll('[data-mml-node="maction"]'));
    }
}
SvgHighlighter.lineSelector = '[data-mjx-linebox]';
SvgHighlighter.lineAttr = 'data-mjx-lineno';
class ChtmlHighlighter extends AbstractHighlighter {
    highlightNode(_node) { }
    unhighlightNode(node) {
        if (node.tagName.toLowerCase() === 'mjx-bbox') {
            node.remove();
        }
    }
    createEnclosure(x, y, w, h, node) {
        const base = node.getBoundingClientRect();
        const enclosure = document.createElement('mjx-bbox');
        enclosure.style.width = w + 'px';
        enclosure.style.height = h + 'px';
        enclosure.style.left = x - base.left + 'px';
        enclosure.style.top = y - h - base.top + 'px';
        enclosure.style.position = 'absolute';
        node.prepend(enclosure);
        return enclosure;
    }
    isMactionNode(node) {
        var _a;
        return ((_a = node.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'mjx-maction';
    }
    getMactionNodes(node) {
        return Array.from(node.querySelectorAll('mjx-maction'));
    }
}
ChtmlHighlighter.lineSelector = 'mjx-linebox';
ChtmlHighlighter.lineAttr = 'lineno';
export function getHighlighter(priority, back, fore, renderer) {
    const highlighter = new highlighterMapping[renderer](priority);
    highlighter.setColor(back, fore);
    return highlighter;
}
const highlighterMapping = {
    SVG: SvgHighlighter,
    CHTML: ChtmlHighlighter,
    generic: ChtmlHighlighter,
};
//# sourceMappingURL=Highlighter.js.map