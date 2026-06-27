import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMtdMixin, } from '../../common/Wrappers/mtd.js';
import { MmlMtd } from '../../../core/MmlTree/MmlNodes/mtd.js';
export const ChtmlMtd = (function () {
    var _a;
    const Base = CommonMtdMixin(ChtmlWrapper);
    return _a = class ChtmlMtd extends Base {
            toCHTML(parents) {
                super.toCHTML(parents);
                const ralign = this.node.attributes.get('rowalign');
                const calign = this.node.attributes.get('columnalign');
                const palign = this.parent.node.attributes.get('rowalign');
                if (ralign !== palign) {
                    this.adaptor.setAttribute(this.dom[0], 'rowalign', ralign);
                }
                if (calign !== 'center' &&
                    (this.parent.kind !== 'mlabeledtr' ||
                        this !== this.parent.childNodes[0] ||
                        calign !== this.parent.parent.node.attributes.get('side'))) {
                    this.adaptor.setStyle(this.dom[0], 'textAlign', calign);
                }
                if (this.parent.parent.node.getProperty('useHeight')) {
                    this.adaptor.append(this.dom[0], this.html('mjx-tstrut'));
                }
            }
        },
        _a.kind = MmlMtd.prototype.kind,
        _a.styles = {
            'mjx-mtd': {
                display: 'table-cell',
                'text-align': 'center',
                padding: '.215em .4em',
            },
            'mjx-mtd:first-child': {
                'padding-left': 0,
            },
            'mjx-mtd:last-child': {
                'padding-right': 0,
            },
            'mjx-mtable > * > mjx-itable > *:first-child > mjx-mtd': {
                'padding-top': 0,
            },
            'mjx-mtable > * > mjx-itable > *:last-child > mjx-mtd': {
                'padding-bottom': 0,
            },
            'mjx-tstrut': {
                display: 'inline-block',
                height: '1em',
                'vertical-align': '-.25em',
            },
            'mjx-labels[align="left"] > mjx-mtr > mjx-mtd': {
                'text-align': 'left',
            },
            'mjx-labels[align="right"] > mjx-mtr > mjx-mtd': {
                'text-align': 'right',
            },
            'mjx-mtd[extra]': {
                padding: 0,
            },
            'mjx-mtd[rowalign="top"]': {
                'vertical-align': 'top',
            },
            'mjx-mtd[rowalign="center"]': {
                'vertical-align': 'middle',
            },
            'mjx-mtd[rowalign="bottom"]': {
                'vertical-align': 'bottom',
            },
            'mjx-mtd[rowalign="baseline"]': {
                'vertical-align': 'baseline',
            },
            'mjx-mtd[rowalign="axis"]': {
                'vertical-align': '.25em',
            },
        },
        _a;
})();
//# sourceMappingURL=mtd.js.map