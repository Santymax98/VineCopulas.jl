import { SvgWrapper } from '../Wrapper.js';
import { CommonMtdMixin, } from '../../common/Wrappers/mtd.js';
import { MmlMtd } from '../../../core/MmlTree/MmlNodes/mtd.js';
export const SvgMtd = (function () {
    var _a;
    const Base = CommonMtdMixin(SvgWrapper);
    return _a = class SvgMtd extends Base {
            placeCell(x, y, W, H, D) {
                const bbox = this.getBBox();
                const h = Math.max(bbox.h, 0.75);
                const d = Math.max(bbox.d, 0.25);
                const calign = this.node.attributes.get('columnalign');
                const ralign = this.node.attributes.get('rowalign');
                const alignX = this.getAlignX(W, bbox, calign);
                const alignY = this.getAlignY(H, D, h, d, ralign);
                this.place(x + alignX, y + alignY);
                return [alignX, alignY];
            }
            placeColor(x, y, W, H) {
                const adaptor = this.adaptor;
                const child = this.firstChild();
                if (child &&
                    adaptor.kind(child) === 'rect' &&
                    adaptor.getAttribute(child, 'data-bgcolor')) {
                    adaptor.setAttribute(child, 'x', this.fixed(x));
                    adaptor.setAttribute(child, 'y', this.fixed(y));
                    adaptor.setAttribute(child, 'width', this.fixed(W));
                    adaptor.setAttribute(child, 'height', this.fixed(H));
                }
            }
        },
        _a.kind = MmlMtd.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtd.js.map