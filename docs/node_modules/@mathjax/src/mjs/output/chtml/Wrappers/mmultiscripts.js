import { CommonMmultiscriptsMixin, } from '../../common/Wrappers/mmultiscripts.js';
import { ChtmlMsubsup } from './msubsup.js';
import { MmlMmultiscripts } from '../../../core/MmlTree/MmlNodes/mmultiscripts.js';
import { split } from '../../../util/string.js';
export const ChtmlMmultiscripts = (function () {
    var _a;
    const Base = CommonMmultiscriptsMixin(ChtmlMsubsup);
    return _a = class ChtmlMmultiscripts extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                const chtml = this.standardChtmlNodes(parents);
                const data = this.scriptData;
                const scriptalign = this.node.getProperty('scriptalign') || 'right left';
                const [preAlign, postAlign] = split(scriptalign + ' ' + scriptalign);
                const [u, v] = this.getCombinedUV();
                if (data.numPrescripts) {
                    const scripts = this.addScripts(this.dom[0], u, -v, true, data.psub, data.psup, this.firstPrescript, data.numPrescripts);
                    if (preAlign !== 'right') {
                        this.adaptor.setAttribute(scripts, 'script-align', preAlign);
                    }
                }
                this.childNodes[0].toCHTML(chtml);
                if (data.numScripts) {
                    const scripts = this.addScripts(this.dom[this.dom.length - 1], u, -v, false, data.sub, data.sup, 1, data.numScripts);
                    if (postAlign !== 'left') {
                        this.adaptor.setAttribute(scripts, 'script-align', postAlign);
                    }
                }
            }
            addScripts(dom, u, v, isPre, sub, sup, i, n) {
                const adaptor = this.adaptor;
                const q = u - sup.d + (v - sub.h);
                const U = u < 0 && v === 0 ? sub.h + u : u;
                const rowdef = q > 0 ? { style: { height: this.em(q) } } : {};
                const tabledef = U ? { style: { 'vertical-align': this.em(U) } } : {};
                const supRow = this.html('mjx-row');
                const sepRow = this.html('mjx-row', rowdef);
                const subRow = this.html('mjx-row');
                const name = 'mjx-' + (isPre ? 'pre' : '') + 'scripts';
                const m = i + 2 * n;
                while (i < m) {
                    this.childNodes[i++].toCHTML([
                        adaptor.append(subRow, this.html('mjx-cell')),
                    ]);
                    this.childNodes[i++].toCHTML([
                        adaptor.append(supRow, this.html('mjx-cell')),
                    ]);
                }
                return adaptor.append(dom, this.html(name, tabledef, [supRow, sepRow, subRow]));
            }
        },
        _a.kind = MmlMmultiscripts.prototype.kind,
        _a.styles = {
            'mjx-prescripts': {
                display: 'inline-table',
                'padding-left': '.05em',
            },
            'mjx-scripts': {
                display: 'inline-table',
                'padding-right': '.05em',
            },
            'mjx-prescripts > mjx-row > mjx-cell': {
                'text-align': 'right',
            },
            '[script-align="left"] > mjx-row > mjx-cell': {
                'text-align': 'left',
            },
            '[script-align="center"] > mjx-row > mjx-cell': {
                'text-align': 'center',
            },
            '[script-align="right"] > mjx-row > mjx-cell': {
                'text-align': 'right',
            },
            'mjx-none': {
                display: 'inline-block',
                height: '1px',
            },
        },
        _a;
})();
//# sourceMappingURL=mmultiscripts.js.map