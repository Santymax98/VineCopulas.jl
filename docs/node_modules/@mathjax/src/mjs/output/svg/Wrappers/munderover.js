import { SvgMsub, SvgMsup, SvgMsubsup, } from './msubsup.js';
import { CommonMunderMixin, CommonMoverMixin, CommonMunderoverMixin, } from '../../common/Wrappers/munderover.js';
import { MmlMunderover, MmlMunder, MmlMover, } from '../../../core/MmlTree/MmlNodes/munderover.js';
export const SvgMunder = (function () {
    var _a;
    const Base = CommonMunderMixin(SvgMsub);
    return _a = class SvgMunder extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toSVG(parents);
                    return;
                }
                const svg = this.standardSvgNodes(parents);
                const [base, script] = [this.baseChild, this.scriptChild];
                const [bbox, sbox] = [base.getOuterBBox(), script.getOuterBBox()];
                base.toSVG(svg);
                script.toSVG(svg);
                const delta = this.isLineBelow
                    ? 0
                    : this.getDelta(this.scriptChild, true);
                const v = this.getUnderKV(bbox, sbox)[1];
                const [bx, sx] = this.getDeltaW([bbox, sbox], [0, -delta]);
                base.place(bx, 0);
                script.place(sx, v);
            }
        },
        _a.kind = MmlMunder.prototype.kind,
        _a;
})();
export const SvgMover = (function () {
    var _a;
    const Base = CommonMoverMixin(SvgMsup);
    return _a = class SvgMover extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toSVG(parents);
                    return;
                }
                const svg = this.standardSvgNodes(parents);
                const [base, script] = [this.baseChild, this.scriptChild];
                const [bbox, sbox] = [base.getOuterBBox(), script.getOuterBBox()];
                base.toSVG(svg);
                script.toSVG(svg);
                const delta = this.isLineAbove ? 0 : this.getDelta(this.scriptChild);
                const u = this.getOverKU(bbox, sbox)[1];
                const [bx, sx] = this.getDeltaW([bbox, sbox], [0, delta]);
                base.place(bx, 0);
                script.place(sx, u);
            }
        },
        _a.kind = MmlMover.prototype.kind,
        _a;
})();
export const SvgMunderover = (function () {
    var _a;
    const Base = CommonMunderoverMixin(SvgMsubsup);
    return _a = class SvgMunderover extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toSVG(parents);
                    return;
                }
                const svg = this.standardSvgNodes(parents);
                const [base, over, under] = [
                    this.baseChild,
                    this.overChild,
                    this.underChild,
                ];
                const [bbox, obox, ubox] = [
                    base.getOuterBBox(),
                    over.getOuterBBox(),
                    under.getOuterBBox(),
                ];
                base.toSVG(svg);
                under.toSVG(svg);
                over.toSVG(svg);
                const odelta = this.getDelta(this.overChild);
                const udelta = this.getDelta(this.underChild, true);
                const u = this.getOverKU(bbox, obox)[1];
                const v = this.getUnderKV(bbox, ubox)[1];
                const [bx, ux, ox] = this.getDeltaW([bbox, ubox, obox], [0, this.isLineBelow ? 0 : -udelta, this.isLineAbove ? 0 : odelta]);
                base.place(bx, 0);
                under.place(ux, v);
                over.place(ox, u);
            }
        },
        _a.kind = MmlMunderover.prototype.kind,
        _a;
})();
//# sourceMappingURL=munderover.js.map