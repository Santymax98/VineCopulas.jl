import { CommonMunderMixin, CommonMoverMixin, CommonMunderoverMixin, } from '../../common/Wrappers/munderover.js';
import { MmlMunderover, MmlMunder, MmlMover, } from '../../../core/MmlTree/MmlNodes/munderover.js';
import { ChtmlMsub, ChtmlMsup, ChtmlMsubsup, } from './msubsup.js';
export const ChtmlMunder = (function () {
    var _a;
    const Base = CommonMunderMixin(ChtmlMsub);
    return _a = class ChtmlMunder extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toCHTML(parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                const base = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-row')), this.html('mjx-base'));
                const under = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-row')), this.html('mjx-under'));
                this.baseChild.toCHTML([base]);
                this.scriptChild.toCHTML([under]);
                const basebox = this.baseChild.getOuterBBox();
                const underbox = this.scriptChild.getOuterBBox();
                const k = this.getUnderKV(basebox, underbox)[0];
                const delta = this.isLineBelow
                    ? 0
                    : this.getDelta(this.scriptChild, true);
                this.adaptor.setStyle(under, 'paddingTop', this.em(k));
                this.setDeltaW([base, under], this.getDeltaW([basebox, underbox], [0, -delta]));
                this.adjustUnderDepth(under, underbox);
            }
        },
        _a.kind = MmlMunder.prototype.kind,
        _a.styles = {
            'mjx-over': {
                'text-align': 'left',
            },
            'mjx-munder:not([limits="false"])': {
                display: 'inline-table',
            },
            'mjx-munder > mjx-row': {
                'text-align': 'left',
            },
            'mjx-under': {
                'padding-bottom': '.1em',
            },
        },
        _a;
})();
export const ChtmlMover = (function () {
    var _a;
    const Base = CommonMoverMixin(ChtmlMsup);
    return _a = class ChtmlMover extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toCHTML(parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                const over = this.adaptor.append(this.dom[0], this.html('mjx-over'));
                const base = this.adaptor.append(this.dom[0], this.html('mjx-base'));
                this.scriptChild.toCHTML([over]);
                this.baseChild.toCHTML([base]);
                const overbox = this.scriptChild.getOuterBBox();
                const basebox = this.baseChild.getOuterBBox();
                this.adjustBaseHeight(base, basebox);
                const k = this.getOverKU(basebox, overbox)[0];
                const delta = this.isLineAbove ? 0 : this.getDelta(this.scriptChild);
                this.adaptor.setStyle(over, 'paddingBottom', this.em(k));
                this.setDeltaW([base, over], this.getDeltaW([basebox, overbox], [0, delta]));
                this.adjustOverDepth(over, overbox);
            }
        },
        _a.kind = MmlMover.prototype.kind,
        _a.styles = {
            'mjx-mover:not([limits="false"])': {
                'padding-top': '.1em',
            },
            [['base', 'over']
                .map((node) => `mjx-mover:not([limits="false"]) > mjx-${node}`)
                .join(', ')]: {
                display: 'block',
                'text-align': 'left',
            },
        },
        _a;
})();
export const ChtmlMunderover = (function () {
    var _a;
    const Base = CommonMunderoverMixin(ChtmlMsubsup);
    return _a = class ChtmlMunderover extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    super.toCHTML(parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                const over = this.adaptor.append(this.dom[0], this.html('mjx-over'));
                const table = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-box')), this.html('mjx-munder'));
                const base = this.adaptor.append(this.adaptor.append(table, this.html('mjx-row')), this.html('mjx-base'));
                const under = this.adaptor.append(this.adaptor.append(table, this.html('mjx-row')), this.html('mjx-under'));
                this.overChild.toCHTML([over]);
                this.baseChild.toCHTML([base]);
                this.underChild.toCHTML([under]);
                const overbox = this.overChild.getOuterBBox();
                const basebox = this.baseChild.getOuterBBox();
                const underbox = this.underChild.getOuterBBox();
                this.adjustBaseHeight(base, basebox);
                const ok = this.getOverKU(basebox, overbox)[0];
                const uk = this.getUnderKV(basebox, underbox)[0];
                const odelta = this.getDelta(this.overChild);
                const udelta = this.getDelta(this.underChild, true);
                this.adaptor.setStyle(over, 'paddingBottom', this.em(ok));
                this.adaptor.setStyle(under, 'paddingTop', this.em(uk));
                this.setDeltaW([base, under, over], this.getDeltaW([basebox, underbox, overbox], [0, this.isLineBelow ? 0 : -udelta, this.isLineAbove ? 0 : odelta]));
                this.adjustOverDepth(over, overbox);
                this.adjustUnderDepth(under, underbox);
            }
        },
        _a.kind = MmlMunderover.prototype.kind,
        _a.styles = {
            'mjx-munderover:not([limits="false"])': {
                'padding-top': '.1em',
            },
            [['over', 'box']
                .map((node) => `mjx-munderover:not([limits="false"]) > mjx-${node}`)
                .join(', ')]: {
                display: 'block',
            },
        },
        _a;
})();
//# sourceMappingURL=munderover.js.map