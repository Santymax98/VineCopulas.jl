import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMtrMixin, CommonMlabeledtrMixin, } from '../../common/Wrappers/mtr.js';
import { MmlMtr, MmlMlabeledtr } from '../../../core/MmlTree/MmlNodes/mtr.js';
export const ChtmlMtr = (function () {
    var _a;
    const Base = CommonMtrMixin(ChtmlWrapper);
    return _a = class ChtmlMtr extends Base {
            toCHTML(parents) {
                super.toCHTML(parents);
                const align = this.node.attributes.get('rowalign');
                if (align !== 'baseline') {
                    this.adaptor.setAttribute(this.dom[0], 'rowalign', align);
                }
                const { h, d } = this.getBBox();
                this.adaptor.setStyle(this.dom[0], 'height', this.em(h + d));
            }
        },
        _a.kind = MmlMtr.prototype.kind,
        _a.styles = {
            'mjx-mtr': {
                display: 'table-row',
            },
            'mjx-mtr[rowalign="top"] > mjx-mtd': {
                'vertical-align': 'top',
            },
            'mjx-mtr[rowalign="center"] > mjx-mtd': {
                'vertical-align': 'middle',
            },
            'mjx-mtr[rowalign="bottom"] > mjx-mtd': {
                'vertical-align': 'bottom',
            },
            'mjx-mtr[rowalign="baseline"] > mjx-mtd': {
                'vertical-align': 'baseline',
            },
            'mjx-mtr[rowalign="axis"] > mjx-mtd': {
                'vertical-align': '.25em',
            },
        },
        _a;
})();
export const ChtmlMlabeledtr = (function () {
    var _a;
    const Base = CommonMlabeledtrMixin(ChtmlMtr);
    return _a = class ChtmlMlabeledtr extends Base {
            toCHTML(parents) {
                super.toCHTML(parents);
                const child = this.adaptor.firstChild(this.dom[0]);
                if (child) {
                    this.adaptor.remove(child);
                    const align = this.node.attributes.get('rowalign');
                    const attr = align !== 'baseline' && align !== 'axis' ? { rowalign: align } : {};
                    const row = this.html('mjx-mtr', attr, [child]);
                    this.adaptor.append(this.parent.labels, row);
                }
            }
            markUsed() {
                super.markUsed();
                this.jax.wrapperUsage.add(ChtmlMtr.kind);
            }
        },
        _a.kind = MmlMlabeledtr.prototype.kind,
        _a.styles = {
            'mjx-mlabeledtr': {
                display: 'table-row',
            },
            'mjx-mlabeledtr[rowalign="top"] > mjx-mtd': {
                'vertical-align': 'top',
            },
            'mjx-mlabeledtr[rowalign="center"] > mjx-mtd': {
                'vertical-align': 'middle',
            },
            'mjx-mlabeledtr[rowalign="bottom"] > mjx-mtd': {
                'vertical-align': 'bottom',
            },
            'mjx-mlabeledtr[rowalign="baseline"] > mjx-mtd': {
                'vertical-align': 'baseline',
            },
            'mjx-mlabeledtr[rowalign="axis"] > mjx-mtd': {
                'vertical-align': '.25em',
            },
        },
        _a;
})();
//# sourceMappingURL=mtr.js.map