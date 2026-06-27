export function CommonMpaddedMixin(Base) {
    return class CommonMpaddedMixin extends Base {
        get containerWidth() {
            const attributes = this.node.attributes;
            const w = attributes.get('width').toString();
            if (!w.match(/^[-+]|%$/) &&
                attributes.get('data-overflow') === 'linebreak') {
                return this.length2em(w);
            }
            return this.parent.containerWidth;
        }
        getDimens() {
            const values = this.node.attributes.getList('width', 'height', 'depth', 'lspace', 'voffset');
            const bbox = this.childNodes[0].getOuterBBox();
            let { w, h, d } = bbox;
            const W = w;
            const H = h;
            const D = d;
            let x = 0;
            let y = 0;
            let dx = 0;
            if (values.width !== '')
                w = this.dimen(values.width, bbox, 'w', 0);
            if (values.height !== '')
                h = this.dimen(values.height, bbox, 'h', 0);
            if (values.depth !== '')
                d = this.dimen(values.depth, bbox, 'd', 0);
            if (values.voffset !== '')
                y = this.dimen(values.voffset, bbox);
            if (values.lspace !== '')
                x = this.dimen(values.lspace, bbox);
            const align = this.node.attributes.get('data-align');
            if (align) {
                dx = this.getAlignX(w, bbox, align);
            }
            return [H, D, W, h - H, d - D, w - W, x, y, dx];
        }
        dimen(length, bbox, d = '', m = null) {
            length = String(length);
            const match = length.match(/width|height|depth/);
            const size = (match
                ? bbox[match[0].charAt(0)]
                : d
                    ? bbox[d]
                    : 0);
            let dimen = this.length2em(length, size) || 0;
            if (length.match(/^[-+]/) && d) {
                dimen += size;
            }
            if (m != null) {
                dimen = Math.max(m, dimen);
            }
            return dimen;
        }
        setBBoxDimens(bbox) {
            const [H, D, W, dh, dd, dw] = this.getDimens();
            bbox.w = W + dw;
            bbox.h = H + dh;
            bbox.d = D + dd;
        }
        computeBBox(bbox, recompute = false) {
            this.setBBoxDimens(bbox);
            const w = this.childNodes[0].getOuterBBox().w;
            if (w > bbox.w) {
                const overflow = this.node.attributes.get('data-overflow');
                if (overflow === 'linebreak' ||
                    (overflow === 'auto' &&
                        this.jax.math.root.attributes.get('overflow') === 'linebreak')) {
                    this.childNodes[0].breakToWidth(bbox.w);
                    this.setBBoxDimens(bbox);
                }
            }
            this.setChildPWidths(recompute, bbox.w);
        }
        getWrapWidth(_i) {
            return this.getBBox().w;
        }
        getChildAlign(_i) {
            return this.node.attributes.get('data-align') || 'left';
        }
    };
}
//# sourceMappingURL=mpadded.js.map