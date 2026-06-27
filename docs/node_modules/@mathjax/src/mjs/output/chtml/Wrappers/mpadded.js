import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMpaddedMixin, } from '../../common/Wrappers/mpadded.js';
import { MmlMpadded } from '../../../core/MmlTree/MmlNodes/mpadded.js';
export const ChtmlMpadded = (function () {
    var _a;
    const Base = CommonMpaddedMixin(ChtmlWrapper);
    return _a = class ChtmlMpadded extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                let chtml = this.standardChtmlNodes(parents);
                const content = [];
                const style = {};
                const [, , W, dh, dd, dw, x, y, dx] = this.getDimens();
                if (dw || this.childNodes[0].getBBox().pwidth) {
                    style.width = this.em(W + dw);
                }
                if (dh || dd) {
                    style.margin = this.em(dh) + ' 0 ' + this.em(dd);
                }
                if (x + dx || y) {
                    style.position = 'relative';
                    const rbox = this.html('mjx-rbox', {
                        style: {
                            left: this.em(x + dx),
                            top: this.em(-y),
                            'max-width': style.width,
                        },
                    });
                    if (x + dx && this.childNodes[0].getBBox().pwidth) {
                        this.adaptor.setAttribute(rbox, 'width', 'full');
                        this.adaptor.setStyle(rbox, 'left', this.em(x));
                    }
                    content.push(rbox);
                }
                chtml = [
                    this.adaptor.append(chtml[0], this.html('mjx-block', { style: style }, content)),
                ];
                if (this.childNodes[0].childNodes.length) {
                    this.childNodes[0].toCHTML([content[0] || chtml[0]]);
                }
                else if (dh || dd) {
                    this.adaptor.append(content[0] || chtml[0], this.html('mjx-box'));
                }
            }
        },
        _a.kind = MmlMpadded.prototype.kind,
        _a.styles = {
            'mjx-mpadded': {
                display: 'inline-block',
            },
            'mjx-rbox': {
                display: 'inline-block',
                position: 'relative',
            },
        },
        _a;
})();
//# sourceMappingURL=mpadded.js.map