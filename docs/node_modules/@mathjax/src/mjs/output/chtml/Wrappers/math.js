import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMathMixin, } from '../../common/Wrappers/math.js';
import { MmlMath } from '../../../core/MmlTree/MmlNodes/math.js';
import { BBox } from '../../../util/BBox.js';
export const ChtmlMath = (function () {
    var _a;
    const Base = CommonMathMixin(ChtmlWrapper);
    return _a = class ChtmlMath extends Base {
            handleDisplay(parent) {
                const adaptor = this.adaptor;
                const [align, shift] = this.getAlignShift();
                if (align !== 'center') {
                    adaptor.setAttribute(parent, 'justify', align);
                }
                if (this.bbox.pwidth === BBox.fullWidth) {
                    adaptor.setAttribute(parent, 'width', 'full');
                    if (this.jax.table) {
                        let { L, w, R } = this.jax.table.getOuterBBox();
                        if (align === 'right') {
                            R = Math.max(R || -shift, -shift);
                        }
                        else if (align === 'left') {
                            L = Math.max(L || shift, shift);
                        }
                        else if (align === 'center') {
                            w += 2 * Math.abs(shift);
                        }
                        const W = this.em(Math.max(0, L + w + R));
                        adaptor.setStyle(parent, 'min-width', W);
                        adaptor.setStyle(this.jax.table.dom[0], 'min-width', W);
                    }
                }
                else {
                    this.setIndent(this.dom[0], align, shift);
                }
            }
            handleInline(parent) {
                const adaptor = this.adaptor;
                const margin = adaptor.getStyle(this.dom[0], 'margin-right');
                if (margin) {
                    adaptor.setStyle(this.dom[0], 'margin-right', '');
                    adaptor.setStyle(parent, 'margin-right', margin);
                    adaptor.setStyle(parent, 'width', '0');
                }
            }
            toCHTML(parents) {
                super.toCHTML(parents);
                const adaptor = this.adaptor;
                const display = this.node.attributes.get('display') === 'block';
                if (display) {
                    adaptor.setAttribute(this.dom[0], 'display', 'true');
                    adaptor.setAttribute(parents[0], 'display', 'true');
                    this.handleDisplay(parents[0]);
                }
                else {
                    this.handleInline(parents[0]);
                }
                adaptor.addClass(this.dom[0], `${this.font.cssFontPrefix}-N`);
            }
            setChildPWidths(recompute, w = null, clear = true) {
                return this.parent ? super.setChildPWidths(recompute, w, clear) : false;
            }
            handleAttributes() {
                super.handleAttributes();
                const adaptor = this.adaptor;
                if (this.node.getProperty('process-breaks')) {
                    this.dom.forEach((dom) => adaptor.setAttribute(dom, 'breakable', 'true'));
                }
            }
        },
        _a.kind = MmlMath.prototype.kind,
        _a.styles = {
            'mjx-math': {
                'line-height': 0,
                'text-align': 'left',
                'text-indent': 0,
                'font-style': 'normal',
                'font-weight': 'normal',
                'font-size': '100%',
                'font-size-adjust': 'none',
                'letter-spacing': 'normal',
                'word-wrap': 'normal',
                'word-spacing': 'normal',
                direction: 'ltr',
                padding: '1px 0',
            },
            'mjx-container[jax="CHTML"][display="true"] mjx-math': {
                padding: 0,
            },
            'mjx-math[breakable]': {
                display: 'inline',
            },
            'mjx-container[jax="CHTML"] mjx-break': {
                'white-space': 'normal',
                'line-height': '0',
                'clip-path': 'rect(0 0 0 0)',
                'font-family': 'MJX-BRK !important',
            },
            'mjx-break[size="0"]': {
                'letter-spacing': 0.001 - 1 + 'em',
            },
            'mjx-break[size="1"]': {
                'letter-spacing': 0.111 - 1 + 'em',
            },
            'mjx-break[size="2"]': {
                'letter-spacing': 0.167 - 1 + 'em',
            },
            'mjx-break[size="3"]': {
                'letter-spacing': 0.222 - 1 + 'em',
            },
            'mjx-break[size="4"]': {
                'letter-spacing': 0.278 - 1 + 'em',
            },
            'mjx-break[size="5"]': {
                'letter-spacing': 0.333 - 1 + 'em',
            },
        },
        _a;
})();
//# sourceMappingURL=math.js.map