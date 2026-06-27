import { SvgWrapper } from '../Wrapper.js';
import { CommonMglyphMixin, } from '../../common/Wrappers/mglyph.js';
import { MmlMglyph } from '../../../core/MmlTree/MmlNodes/mglyph.js';
export const SvgMglyph = (function () {
    var _a;
    const Base = CommonMglyphMixin(SvgWrapper);
    return _a = class SvgMglyph extends Base {
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents);
                if (this.charWrapper) {
                    this.charWrapper.toSVG(svg);
                    return;
                }
                const { src, alt } = this.node.attributes.getList('src', 'alt');
                const h = this.fixed(this.height);
                const w = this.fixed(this.width);
                const y = this.fixed(this.height + (this.valign || 0));
                const properties = {
                    width: w,
                    height: h,
                    transform: 'translate(0 ' + y + ') matrix(1 0 0 -1 0 0)',
                    preserveAspectRatio: 'none',
                    'aria-label': alt,
                    href: src,
                };
                const img = this.svg('image', properties);
                this.adaptor.append(svg[0], img);
            }
        },
        _a.kind = MmlMglyph.prototype.kind,
        _a;
})();
//# sourceMappingURL=mglyph.js.map