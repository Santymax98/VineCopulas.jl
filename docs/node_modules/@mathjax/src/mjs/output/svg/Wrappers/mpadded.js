import { SvgWrapper } from '../Wrapper.js';
import { CommonMpaddedMixin, } from '../../common/Wrappers/mpadded.js';
import { MmlMpadded } from '../../../core/MmlTree/MmlNodes/mpadded.js';
export const SvgMpadded = (function () {
    var _a;
    const Base = CommonMpaddedMixin(SvgWrapper);
    return _a = class SvgMpadded extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                let svg = this.standardSvgNodes(parents);
                const [, , , , , dw, x, y, dx] = this.getDimens();
                const align = this.node.attributes.get('data-align') || 'left';
                const dW = dw < 0 && align !== 'left' ? (align === 'center' ? dw / 2 : dw) : 0;
                const X = x + dx - dW;
                if (X || y) {
                    svg = [this.adaptor.append(svg[0], this.svg('g'))];
                    this.place(X, y, svg[0]);
                }
                this.addChildren(svg);
            }
        },
        _a.kind = MmlMpadded.prototype.kind,
        _a;
})();
//# sourceMappingURL=mpadded.js.map