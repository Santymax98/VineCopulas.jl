import { ChtmlWrapper } from '../Wrapper.js';
import { CommonTextNodeMixin, } from '../../common/Wrappers/TextNode.js';
import { TextNode } from '../../../core/MmlTree/MmlNode.js';
export const ChtmlTextNode = (function () {
    var _a;
    const Base = CommonTextNodeMixin(ChtmlWrapper);
    return _a = class ChtmlTextNode extends Base {
            toCHTML(parents) {
                this.markUsed();
                const parent = parents[0];
                const adaptor = this.adaptor;
                const variant = this.parent.variant;
                const text = this.node.getText();
                if (text.length === 0)
                    return;
                const bbox = this.getBBox();
                if (variant === '-explicitFont') {
                    adaptor.append(parent, this.jax.unknownText(text, variant, bbox.w));
                }
                else {
                    let utext = '';
                    const chars = this.remappedText(text, variant);
                    const H = chars.length > 1 ? this.em(this.parent.getBBox().h) : '';
                    const m = chars.length;
                    for (let i = 0; i < m; i++) {
                        const n = chars[i];
                        const data = this.getVariantChar(variant, n)[3];
                        if (data.unknown) {
                            utext += String.fromCodePoint(n);
                        }
                        else {
                            utext = this.addUtext(utext, variant, parent);
                            const font = data.ff || (data.f ? `${this.font.cssFontPrefix}-${data.f}` : '');
                            const node = adaptor.append(parent, this.html('mjx-c', { class: this.char(n) + (font ? ' ' + font : '') }, [this.text(data.c || String.fromCodePoint(n))]));
                            if (i < m - 1 || bbox.oc) {
                                adaptor.setAttribute(node, 'noic', 'true');
                            }
                            if (H) {
                                adaptor.setStyle(node, 'padding-top', H);
                            }
                            this.font.charUsage.add([variant, n]);
                        }
                    }
                    this.addUtext(utext, variant, parent);
                }
            }
            addUtext(utext, variant, parent) {
                if (utext) {
                    this.adaptor.append(parent, this.jax.unknownText(utext, variant));
                }
                return '';
            }
        },
        _a.kind = TextNode.prototype.kind,
        _a.autoStyle = false,
        _a.styles = {
            'mjx-c': {
                display: 'inline-block',
                width: 0,
                'text-align': 'right',
            },
            'mjx-utext': {
                display: 'inline-block',
                padding: '.75em 0 .2em 0',
            },
        },
        _a;
})();
//# sourceMappingURL=TextNode.js.map