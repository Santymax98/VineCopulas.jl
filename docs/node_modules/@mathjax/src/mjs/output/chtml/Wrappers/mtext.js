import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMtextMixin, } from '../../common/Wrappers/mtext.js';
import { MmlMtext } from '../../../core/MmlTree/MmlNodes/mtext.js';
export const ChtmlMtext = (function () {
    var _a;
    const Base = CommonMtextMixin(ChtmlWrapper);
    return _a = class ChtmlMtext extends Base {
            toCHTML(parents) {
                if (!this.breakCount) {
                    super.toCHTML(parents);
                    return;
                }
                const chtml = this.standardChtmlNodes(parents);
                const textNode = this.textNode.node;
                const childNodes = this.childNodes;
                for (const i of chtml.keys()) {
                    const DOM = [chtml[i]];
                    this.adaptor.append(chtml[i], this.html('mjx-linestrut'));
                    let [si, sj] = this.breakPoints[i - 1] || [0, 0];
                    const [ei, ej] = this.breakPoints[i] || [childNodes.length, 0];
                    let words = childNodes[si].node.getText().split(/ /);
                    if (si === ei) {
                        textNode.setText(words.slice(sj, ej).join(' '));
                        this.textNode.toCHTML(DOM);
                        continue;
                    }
                    textNode.setText(words.slice(sj).join(' '));
                    this.textNode.toCHTML(DOM);
                    while (++si < ei && si < childNodes.length) {
                        childNodes[si].toCHTML(DOM);
                    }
                    if (si < childNodes.length) {
                        words = childNodes[si].node.getText().split(/ /);
                        textNode.setText(words.slice(0, ej).join(' '));
                        this.textNode.toCHTML(DOM);
                    }
                }
            }
        },
        _a.kind = MmlMtext.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtext.js.map