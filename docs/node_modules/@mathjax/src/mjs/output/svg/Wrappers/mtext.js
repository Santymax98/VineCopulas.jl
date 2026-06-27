import { SvgWrapper } from '../Wrapper.js';
import { CommonMtextMixin, } from '../../common/Wrappers/mtext.js';
import { MmlMtext } from '../../../core/MmlTree/MmlNodes/mtext.js';
export const SvgMtext = (function () {
    var _a;
    const Base = CommonMtextMixin(SvgWrapper);
    return _a = class SvgMtext extends Base {
            toSVG(parents) {
                if (!this.breakCount) {
                    super.toSVG(parents);
                    return;
                }
                const svg = this.standardSvgNodes(parents);
                const textNode = this.textNode.node;
                const childNodes = this.childNodes;
                for (const i of svg.keys()) {
                    const DOM = [svg[i]];
                    let [si, sj] = this.breakPoints[i - 1] || [0, 0];
                    const [ei, ej] = this.breakPoints[i] || [childNodes.length, 0];
                    let words = childNodes[si].node.getText().split(/ /);
                    if (si === ei) {
                        textNode.setText(words.slice(sj, ej).join(' '));
                        this.textNode.toSVG(DOM);
                        continue;
                    }
                    textNode.setText(words.slice(sj).join(' '));
                    this.textNode.toSVG(DOM);
                    let x = this.textNode.getBBox().w;
                    while (++si < ei && si < childNodes.length) {
                        const child = childNodes[si];
                        child.toSVG(DOM);
                        if (child.dom) {
                            child.place(x, 0);
                        }
                        x += child.getBBox().w;
                    }
                    if (si < childNodes.length) {
                        words = childNodes[si].node.getText().split(/ /);
                        textNode.setText(words.slice(0, ej).join(' '));
                        this.textNode.toSVG(DOM);
                        this.textNode.place(x, 0);
                    }
                }
            }
        },
        _a.kind = MmlMtext.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtext.js.map