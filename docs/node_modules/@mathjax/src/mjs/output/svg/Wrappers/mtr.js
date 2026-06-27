import { SvgWrapper } from '../Wrapper.js';
import { CommonMtrMixin, CommonMlabeledtrMixin, } from '../../common/Wrappers/mtr.js';
import { MmlMtr, MmlMlabeledtr } from '../../../core/MmlTree/MmlNodes/mtr.js';
export const SvgMtr = (function () {
    var _a;
    const Base = CommonMtrMixin(SvgWrapper);
    return _a = class SvgMtr extends Base {
            placeCell(cell, sizes) {
                const { x, y, lSpace, w, rSpace, lLine, rLine } = sizes;
                const scale = 1 / this.getBBox().rscale;
                const [h, d] = [this.H * scale, this.D * scale];
                const [t, b] = [this.tSpace * scale, this.bSpace * scale];
                const [dx, dy] = cell.placeCell(x + lSpace, y, w, h, d);
                const W = lSpace + w + rSpace;
                cell.placeColor(-(dx + lSpace + lLine / 2), -(d + b + dy), W + (lLine + rLine) / 2, h + d + t + b);
                return W + rLine;
            }
            placeCells(svg) {
                const parent = this.parent;
                const cSpace = parent.getColumnHalfSpacing();
                const cLines = [parent.fLine, ...parent.cLines, parent.fLine];
                const cWidth = parent.getComputedWidths();
                const scale = 1 / this.getBBox().rscale;
                let x = cLines[0];
                for (let i = 0; i < this.numCells; i++) {
                    const child = this.getChild(i);
                    child.toSVG(svg);
                    x += this.placeCell(child, {
                        x: x,
                        y: 0,
                        lSpace: cSpace[i] * scale,
                        rSpace: cSpace[i + 1] * scale,
                        w: cWidth[i] * scale,
                        lLine: cLines[i] * scale,
                        rLine: cLines[i + 1] * scale,
                    });
                }
            }
            placeColor() {
                const scale = 1 / this.getBBox().rscale;
                const adaptor = this.adaptor;
                const child = this.firstChild();
                if (child &&
                    adaptor.kind(child) === 'rect' &&
                    adaptor.getAttribute(child, 'data-bgcolor')) {
                    const [TL, BL] = [(this.tLine / 2) * scale, (this.bLine / 2) * scale];
                    const [TS, BS] = [this.tSpace * scale, this.bSpace * scale];
                    const [H, D] = [this.H * scale, this.D * scale];
                    adaptor.setAttribute(child, 'y', this.fixed(-(D + BS + BL)));
                    adaptor.setAttribute(child, 'width', this.fixed(this.parent.getWidth() * scale));
                    adaptor.setAttribute(child, 'height', this.fixed(TL + TS + H + D + BS + BL));
                }
            }
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents);
                this.placeCells(svg);
                this.placeColor();
            }
        },
        _a.kind = MmlMtr.prototype.kind,
        _a;
})();
export const SvgMlabeledtr = (function () {
    var _a;
    const Base = CommonMlabeledtrMixin(SvgMtr);
    return _a = class SvgMlabeledtr extends Base {
            toSVG(parents) {
                super.toSVG(parents);
                const child = this.childNodes[0];
                if (child) {
                    child.toSVG([this.parent.labels]);
                }
            }
        },
        _a.kind = MmlMlabeledtr.prototype.kind,
        _a;
})();
//# sourceMappingURL=mtr.js.map