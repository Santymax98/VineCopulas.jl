import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMglyphMixin, } from '../../common/Wrappers/mglyph.js';
import { MmlMglyph } from '../../../core/MmlTree/MmlNodes/mglyph.js';
export const ChtmlMglyph = (function () {
    var _a;
    const Base = CommonMglyphMixin(ChtmlWrapper);
    return _a = class ChtmlMglyph extends Base {
            toCHTML(parents) {
                const chtml = this.standardChtmlNodes(parents);
                if (this.charWrapper) {
                    this.charWrapper.toCHTML(chtml);
                    return;
                }
                const { src, alt } = this.node.attributes.getList('src', 'alt');
                const styles = {
                    width: this.em(this.width),
                    height: this.em(this.height),
                };
                if (this.valign) {
                    styles.verticalAlign = this.em(this.valign);
                }
                const img = this.html('img', {
                    src: src,
                    style: styles,
                    alt: alt,
                    title: alt,
                });
                this.adaptor.append(chtml[0], img);
            }
        },
        _a.kind = MmlMglyph.prototype.kind,
        _a.styles = {
            'mjx-mglyph > img': {
                display: 'inline-block',
                border: 0,
                padding: 0,
            },
        },
        _a;
})();
//# sourceMappingURL=mglyph.js.map