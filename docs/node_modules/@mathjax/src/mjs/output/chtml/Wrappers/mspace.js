import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMspaceMixin, } from '../../common/Wrappers/mspace.js';
import { MmlMspace } from '../../../core/MmlTree/MmlNodes/mspace.js';
export const ChtmlMspace = (function () {
    var _a;
    const Base = CommonMspaceMixin(ChtmlWrapper);
    return _a = class ChtmlMspace extends Base {
            toCHTML(parents) {
                if (parents.length > 1) {
                    parents.forEach((dom) => this.adaptor.append(dom, this.html('mjx-linestrut')));
                }
                const chtml = this.standardChtmlNodes(parents);
                let { w, h, d } = this.getBBox();
                if (w < 0) {
                    this.adaptor.setStyle(chtml[0], 'marginRight', this.em(w));
                    w = 0;
                }
                if (w && !this.breakCount) {
                    this.adaptor.setStyle(chtml[0], 'width', this.em(w));
                }
                h = Math.max(0, h + d);
                if (h) {
                    this.adaptor.setStyle(chtml[0], 'height', this.em(Math.max(0, h)));
                }
                if (d) {
                    this.adaptor.setStyle(chtml[0], 'verticalAlign', this.em(-d));
                }
            }
        },
        _a.kind = MmlMspace.prototype.kind,
        _a;
})();
//# sourceMappingURL=mspace.js.map