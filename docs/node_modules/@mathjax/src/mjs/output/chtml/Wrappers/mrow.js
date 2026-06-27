import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMrowMixin, } from '../../common/Wrappers/mrow.js';
import { CommonInferredMrowMixin, } from '../../common/Wrappers/mrow.js';
import { MmlMrow, MmlInferredMrow, } from '../../../core/MmlTree/MmlNodes/mrow.js';
export const ChtmlMrow = (function () {
    var _a;
    const Base = CommonMrowMixin(ChtmlWrapper);
    return _a = class ChtmlMrow extends Base {
            constructor() {
                super(...arguments);
                this.linebreakCount = 0;
            }
            toCHTML(parents) {
                const n = (this.linebreakCount = this.isStack ? 0 : this.breakCount);
                if (n || !this.node.isInferred) {
                    parents = this.standardChtmlNodes(parents);
                }
                else {
                    this.dom = parents;
                }
                this.addChildren(parents);
                if (n) {
                    this.placeLines(parents, n);
                }
                else {
                    this.handleVerticalAlign(parents[0]);
                    this.handleNegativeWidth(parents[0]);
                }
            }
            placeLines(parents, n) {
                var _b, _c;
                this.getBBox();
                const lines = this.lineBBox;
                const adaptor = this.adaptor;
                const [alignfirst, shiftfirst] = ((_b = lines[1].indentData) === null || _b === void 0 ? void 0 : _b[0]) || [
                    'left',
                    '0',
                ];
                for (const i of parents.keys()) {
                    const bbox = lines[i];
                    const [indentalign, indentshift] = i === 0
                        ? [alignfirst, shiftfirst]
                        : ((_c = bbox.indentData) === null || _c === void 0 ? void 0 : _c[i === n ? 2 : 1]) || ['left', '0'];
                    const [align, shift] = this.processIndent(indentalign, indentshift, alignfirst, shiftfirst);
                    adaptor.setAttribute(parents[i], 'align', align);
                    if (shift) {
                        adaptor.setStyle(parents[i], 'margin-left', this.em(shift));
                    }
                    if (i < n && this.jax.math.display) {
                        adaptor.setStyle(parents[i], 'margin-bottom', this.em(bbox.lineLeading));
                    }
                }
            }
            handleVerticalAlign(dom) {
                if (this.dh) {
                    this.adaptor.setStyle(this.adaptor.parent(dom), 'vertical-align', this.em(this.dh));
                }
            }
            handleNegativeWidth(dom) {
                const { w } = this.getBBox();
                if (w < 0) {
                    this.adaptor.setStyle(dom, 'width', this.em(Math.max(0, w)));
                    this.adaptor.setStyle(dom, 'marginRight', this.em(w));
                }
            }
            createChtmlNodes(parents) {
                const n = this.linebreakCount;
                if (!n)
                    return super.createChtmlNodes(parents);
                const adaptor = this.adaptor;
                const kind = this.node.isInferred
                    ? 'mjx-linestack'
                    : 'mjx-' + this.node.kind;
                this.dom = [adaptor.append(parents[0], this.html(kind))];
                if (kind === 'mjx-mrow' && !this.isStack) {
                    adaptor.setAttribute(this.dom[0], 'break-top', 'true');
                }
                if (this.node.getProperty('process-breaks')) {
                    adaptor.setAttribute(this.dom[0], 'breakable', 'true');
                }
                if (this.node.isInferred || !this.isStack) {
                    const valign = this.parent.node.attributes.get('data-vertical-align');
                    if (valign === 'middle' || valign === 'center' || valign === 'bottom') {
                        adaptor.setAttribute(this.dom[0], 'break-align', valign);
                    }
                }
                this.dom = [
                    adaptor.append(this.handleHref(parents)[0], this.dom[0]),
                ];
                const chtml = Array(n);
                for (let i = 0; i <= n; i++) {
                    chtml[i] = adaptor.append(this.dom[0], this.html('mjx-linebox', { lineno: i }));
                }
                return chtml;
            }
            addChildren(parents) {
                let i = 0;
                for (const child of this.childNodes) {
                    const n = child.breakCount;
                    child.toCHTML(parents.slice(i, i + n + 1));
                    i += n;
                }
            }
        },
        _a.kind = MmlMrow.prototype.kind,
        _a.styles = {
            'mjx-linestack, mjx-mrow[break-top]': {
                display: 'inline-table',
                width: '100%',
            },
            'mjx-linestack[break-align="bottom"], mjx-mrow[break-top][break-align="bottom"]': {
                display: 'inline-block',
            },
            'mjx-linestack[break-align="middle"], mjx-mrow[break-top][break-align="middle"]': {
                'vertical-align': 'middle',
            },
            'mjx-linestack[break-align="center"], mjx-mrow[break-top][break-align="center"]': {
                'vertical-align': 'middle',
            },
            'mjx-linestack[breakable]': {
                display: 'inline',
            },
            'mjx-linestack[breakable] > mjx-linebox': {
                display: 'inline',
            },
            'mjx-linestack[breakable] > mjx-linebox::before': {
                'white-space': 'pre',
                content: '"\\A"',
            },
            'mjx-linestack[breakable] > mjx-linebox::after': {
                'white-space': 'normal',
                content: '" "',
                'letter-spacing': '-.999em',
                'font-family': 'MJX-BRK',
            },
            'mjx-linestack[breakable] > mjx-linebox:first-of-type::before': {
                display: 'none',
            },
            'mjx-linestack[breakable] > mjx-linebox:last-of-type::after': {
                display: 'none',
            },
            'mjx-linebox': {
                display: 'block',
            },
            'mjx-linebox[align="left"]': {
                'text-align': 'left',
            },
            'mjx-linebox[align="center"]': {
                'text-align': 'center',
            },
            'mjx-linebox[align="right"]': {
                'text-align': 'right',
            },
            'mjx-linestrut': {
                display: 'inline-block',
                height: '1em',
                'vertical-align': '-.25em',
            },
        },
        _a;
})();
export const ChtmlInferredMrow = (function () {
    var _a;
    const Base = CommonInferredMrowMixin(ChtmlMrow);
    return _a = class ChtmlInferredMrow extends Base {
        },
        _a.kind = MmlInferredMrow.prototype.kind,
        _a;
})();
//# sourceMappingURL=mrow.js.map