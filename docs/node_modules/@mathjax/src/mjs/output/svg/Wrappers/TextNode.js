import { SvgWrapper } from '../Wrapper.js';
import { CommonTextNodeMixin, } from '../../common/Wrappers/TextNode.js';
import { TextNode } from '../../../core/MmlTree/MmlNode.js';
export const SvgTextNode = (function () {
    var _a;
    const Base = CommonTextNodeMixin(SvgWrapper);
    return _a = class SvgTextNode extends Base {
            static addStyles(styles, jax) {
                styles.addStyles({
                    'mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c]': {
                        'stroke-width': jax.options.blacker,
                    },
                });
            }
            toSVG(parents) {
                const adaptor = this.adaptor;
                const variant = this.parent.variant;
                const text = this.node.getText();
                if (text.length === 0)
                    return;
                if (variant === '-explicitFont') {
                    this.dom = [
                        adaptor.append(parents[0], this.jax.unknownText(text, variant)),
                    ];
                }
                else {
                    const chars = this.remappedText(text, variant);
                    if (this.parent.childNodes.length > 1) {
                        parents = this.dom = [
                            adaptor.append(parents[0], this.svg('g', { 'data-mml-node': 'text' })),
                        ];
                    }
                    else {
                        this.dom = parents;
                    }
                    let x = 0;
                    for (const n of chars) {
                        x += this.placeChar(n, x, 0, parents[0], variant, true);
                    }
                    this.addUtext(x, 0, parents[0], variant);
                }
            }
        },
        _a.kind = TextNode.prototype.kind,
        _a;
})();
//# sourceMappingURL=TextNode.js.map