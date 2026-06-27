import { split } from '../../../util/string.js';
export const TooltipData = {
    dx: '.2em',
    dy: '.1em',
    postDelay: 600,
    clearDelay: 100,
    hoverTimer: new Map(),
    clearTimer: new Map(),
    stopTimers: (node, data) => {
        if (data.clearTimer.has(node)) {
            clearTimeout(data.clearTimer.get(node));
            data.clearTimer.delete(node);
        }
        if (data.hoverTimer.has(node)) {
            clearTimeout(data.hoverTimer.get(node));
            data.hoverTimer.delete(node);
        }
    }
};
export function CommonMactionMixin(Base) {
    return class CommonMactionMixin extends Base {
        get selected() {
            const selection = this.node.attributes.get('selection');
            const i = Math.max(1, Math.min(this.childNodes.length, selection)) - 1;
            return (this.childNodes[i] || this.wrap(this.node.selected));
        }
        getParameters() {
            const offsets = this.node.attributes.get('data-offsets');
            const [dx, dy] = split(offsets || '');
            this.tipDx = this.length2em(dx || TooltipData.dx);
            this.tipDy = this.length2em(dy || TooltipData.dy);
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            const actions = this.constructor
                .actions;
            const action = this.node.attributes.get('actiontype');
            const [handler, data] = actions.get(action) || [
                ((_node, _data) => { }),
                {},
            ];
            this.action = handler;
            this.data = data;
            this.getParameters();
        }
        computeBBox(bbox, recompute = false) {
            bbox.updateFrom(this.selected.getOuterBBox());
            this.selected.setChildPWidths(recompute);
        }
        get breakCount() {
            return this.node.isEmbellished
                ? this.selected.coreMO().embellishedBreakCount
                : this.selected.breakCount;
        }
        computeLineBBox(i) {
            return this.getChildLineBBox(this.selected, i);
        }
    };
}
//# sourceMappingURL=maction.js.map