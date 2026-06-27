import { SvgWrapper } from '../Wrapper.js';
import { MmlMerror } from '../../../core/MmlTree/MmlNodes/merror.js';
export const SvgMerror = (function () {
    var _a;
    return _a = class SvgMerror extends SvgWrapper {
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents);
                const { h, d, w } = this.getBBox();
                this.adaptor.append(this.dom[0], this.svg('rect', {
                    'data-background': true,
                    width: this.fixed(w),
                    height: this.fixed(h + d),
                    y: this.fixed(-d),
                }));
                const title = this.node.attributes.get('title');
                if (title) {
                    this.adaptor.append(this.dom[0], this.svg('title', {}, [this.adaptor.text(title)]));
                }
                this.addChildren(svg);
            }
        },
        _a.kind = MmlMerror.prototype.kind,
        _a.styles = {
            'g[data-mml-node="merror"] > g': {
                fill: 'red',
                stroke: 'red',
            },
            'g[data-mml-node="merror"] > rect[data-background]': {
                fill: 'yellow',
                stroke: 'none',
            },
        },
        _a;
})();
//# sourceMappingURL=merror.js.map