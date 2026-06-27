export function CommonMathMixin(Base) {
    return class CommonMathMixin extends Base {
        getWrapWidth(_i) {
            return this.parent
                ? this.getBBox().w
                : this.metrics.containerWidth / this.jax.pxPerEm;
        }
        computeBBox(bbox, recompute = false) {
            super.computeBBox(bbox, recompute);
            const attributes = this.node.attributes;
            if (!this.parent &&
                this.jax.math.display &&
                attributes.get('overflow') === 'linebreak') {
                const W = this.containerWidth;
                if (bbox.w > W) {
                    this.childNodes[0].breakToWidth(W);
                }
                bbox.updateFrom(this.childNodes[0].getBBox());
            }
        }
    };
}
//# sourceMappingURL=math.js.map