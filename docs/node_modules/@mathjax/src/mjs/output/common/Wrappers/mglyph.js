export function CommonMglyphMixin(Base) {
    return class CommonMglyphMixin extends Base {
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.getParameters();
        }
        getParameters() {
            const { width, height, valign, src, index } = this.node.attributes.getList('width', 'height', 'valign', 'src', 'index');
            if (src) {
                this.width = width === 'auto' ? 1 : this.length2em(width);
                this.height = height === 'auto' ? 1 : this.length2em(height);
                this.valign = this.length2em(valign || '0');
            }
            else {
                const text = String.fromCodePoint(parseInt(index));
                const mmlFactory = this.node.factory;
                this.charWrapper = this.wrap(mmlFactory.create('text').setText(text));
                this.charWrapper.parent = this;
            }
        }
        computeBBox(bbox, _recompute = false) {
            if (this.charWrapper) {
                bbox.updateFrom(this.charWrapper.getBBox());
            }
            else {
                bbox.w = this.width;
                bbox.h = this.height + this.valign;
                bbox.d = -this.valign;
            }
        }
    };
}
//# sourceMappingURL=mglyph.js.map