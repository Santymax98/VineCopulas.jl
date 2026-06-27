export function CommonTextNodeMixin(Base) {
    return class CommonTextNodeMixin extends Base {
        remappedText(text, variant) {
            const c = this.parent.stretch.c;
            return c ? [c] : this.parent.remapChars(this.unicodeChars(text, variant));
        }
        computeBBox(bbox, _recompute = false) {
            const variant = this.parent.variant;
            const text = this.node.getText();
            if (variant === '-explicitFont') {
                const font = this.jax.getFontData(this.parent.styles);
                const { w, h, d } = this.jax.measureText(text, variant, font);
                bbox.h = h;
                bbox.d = d;
                bbox.w = w;
            }
            else {
                const chars = this.remappedText(text, variant);
                let utext = '';
                bbox.empty();
                for (let i = 0; i < chars.length; i++) {
                    const [h, d, w, data] = this.getVariantChar(variant, chars[i]);
                    if (data.unknown) {
                        utext += String.fromCodePoint(chars[i]);
                    }
                    else {
                        utext = this.addUtextBBox(bbox, utext, variant);
                        this.updateBBox(bbox, h, d, w);
                        bbox.ic = data.ic || 0;
                        bbox.sk = data.sk || 0;
                        bbox.dx = data.dx || 0;
                        if (!data.oc || i < chars.length - 1)
                            continue;
                        const children = this.parent.childNodes;
                        if (this.node !== children[children.length - 1].node)
                            continue;
                        const parent = this.parent.parent.node;
                        let next = parent.isKind('mrow') || parent.isInferred
                            ? parent.childNodes[parent.childIndex(this.parent.node) + 1]
                            : null;
                        if ((next === null || next === void 0 ? void 0 : next.isKind('mo')) && next.getText() === '\u2062') {
                            next = parent.childNodes[parent.childIndex(next) + 1];
                        }
                        if (!next || next.attributes.get('mathvariant') !== variant) {
                            bbox.ic = data.oc;
                        }
                        else {
                            bbox.oc = data.oc;
                        }
                    }
                }
                this.addUtextBBox(bbox, utext, variant);
                if (chars.length > 1) {
                    bbox.sk = 0;
                }
                bbox.clean();
            }
        }
        addUtextBBox(bbox, utext, variant) {
            if (utext) {
                const { h, d, w } = this.jax.measureText(utext, variant);
                this.updateBBox(bbox, h, d, w);
            }
            return '';
        }
        updateBBox(bbox, h, d, w) {
            bbox.w += w;
            if (h > bbox.h) {
                bbox.h = h;
            }
            if (d > bbox.d) {
                bbox.d = d;
            }
        }
        getStyles() { }
        getVariant() { }
        getScale() { }
        getSpace() { }
    };
}
//# sourceMappingURL=TextNode.js.map