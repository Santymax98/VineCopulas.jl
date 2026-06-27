import { SvgWrapper } from '../Wrapper.js';
import { CommonMrowMixin, CommonInferredMrowMixin, } from '../../common/Wrappers/mrow.js';
import { MmlMrow, MmlInferredMrow, } from '../../../core/MmlTree/MmlNodes/mrow.js';
export const SvgMrow = (function () {
    var _a;
    const Base = CommonMrowMixin(SvgWrapper);
    return _a = class SvgMrow extends Base {
            constructor() {
                super(...arguments);
                this.linebreakCount = 0;
            }
            toSVG(parents) {
                this.getBBox();
                const n = (this.linebreakCount = this.isStack ? 0 : this.breakCount);
                parents =
                    n || !this.node.isInferred
                        ? this.standardSvgNodes(parents)
                        : this.getSvgNodes(parents);
                this.addChildren(parents);
                if (n) {
                    this.placeLines(parents);
                }
            }
            getSvgNodes(parents) {
                if (this.dh) {
                    const g = this.svg('g', {
                        transform: `translate(0 ${this.fixed(this.dh)})`,
                    });
                    parents = [this.adaptor.append(parents[0], g)];
                }
                this.dom = parents;
                return parents;
            }
            placeLines(parents) {
                var _b;
                const lines = this.lineBBox;
                const display = this.jax.math.display;
                let y = this.dh;
                for (const k of parents.keys()) {
                    const lbox = lines[k];
                    this.place(lbox.L || 0, y, parents[k]);
                    y -=
                        Math.max(0.25, lbox.d) +
                            (display ? lbox.lineLeading : 0) +
                            Math.max(0.75, ((_b = lines[k + 1]) === null || _b === void 0 ? void 0 : _b.h) || 0);
                }
            }
            createSvgNodes(parents) {
                const n = this.linebreakCount;
                if (!n)
                    return super.createSvgNodes(parents);
                const adaptor = this.adaptor;
                const def = this.node.isInferred
                    ? { 'data-mjx-linestack': true }
                    : { 'data-mml-node': this.node.kind };
                this.dom = [adaptor.append(parents[0], this.svg('g', def))];
                this.dom = [
                    adaptor.append(this.handleHref(parents)[0], this.dom[0]),
                ];
                const svg = Array(n);
                for (let i = 0; i <= n; i++) {
                    svg[i] = adaptor.append(this.dom[0], this.svg('g', { 'data-mjx-linebox': true, 'data-mjx-lineno': i }));
                }
                return svg;
            }
            addChildren(parents) {
                let x = 0;
                let i = 0;
                for (const child of this.childNodes) {
                    const n = child.breakCount;
                    child.toSVG(parents.slice(i, i + n + 1));
                    if (child.dom) {
                        let k = 0;
                        for (const dom of child.dom) {
                            if (dom) {
                                const dx = k ? 0 : child.dx;
                                const cbox = child.getLineBBox(k++);
                                x += (cbox.L + dx) * cbox.rscale;
                                this.place(x, 0, dom);
                                x += (cbox.w + cbox.R - dx) * cbox.rscale;
                            }
                            if (n) {
                                x = 0;
                            }
                        }
                        if (n) {
                            const cbox = child.getLineBBox(n);
                            x += (cbox.w + cbox.R) * cbox.rscale;
                        }
                    }
                    i += n;
                }
            }
        },
        _a.kind = MmlMrow.prototype.kind,
        _a;
})();
export const SvgInferredMrow = (function () {
    var _a;
    const Base = CommonInferredMrowMixin(SvgMrow);
    return _a = class SvgInferredMrowNTD extends Base {
        },
        _a.kind = MmlInferredMrow.prototype.kind,
        _a;
})();
//# sourceMappingURL=mrow.js.map