export function CommonSemanticsMixin(Base) {
    return class CommonSemanticsMixin extends Base {
        computeBBox(bbox, _recompute = false) {
            if (this.childNodes.length) {
                const { w, h, d } = this.childNodes[0].getBBox();
                bbox.w = w;
                bbox.h = h;
                bbox.d = d;
            }
        }
        get breakCount() {
            return this.node.isEmbellished
                ? this.coreMO().embellishedBreakCount
                : this.childNodes[0].breakCount;
        }
    };
}
//# sourceMappingURL=semantics.js.map