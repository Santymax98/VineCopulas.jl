import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMsqrtMixin, } from '../../common/Wrappers/msqrt.js';
import { MmlMsqrt } from '../../../core/MmlTree/MmlNodes/msqrt.js';
export const ChtmlMsqrt = (function () {
    var _a;
    const Base = CommonMsqrtMixin(ChtmlWrapper);
    return _a = class ChtmlMsqrt extends Base {
            toCHTML(parents) {
                const surd = this.surd;
                const base = this.childNodes[this.base];
                const sbox = surd.getBBox();
                const bbox = base.getOuterBBox();
                const [, q] = this.getPQ(sbox);
                const t = this.font.params.surd_height;
                const H = bbox.h + q + t;
                const adaptor = this.adaptor;
                const CHTML = this.standardChtmlNodes(parents);
                let SURD, BASE, ROOT, root;
                if (this.root != null) {
                    ROOT = adaptor.append(CHTML[0], this.html('mjx-root'));
                    root = this.childNodes[this.root];
                }
                const SQRT = adaptor.append(CHTML[0], this.html('mjx-sqrt', {}, [
                    (SURD = this.html('mjx-surd')),
                    (BASE = this.html('mjx-box', { style: { paddingTop: this.em(q) } })),
                ]));
                if (t !== 0.06) {
                    adaptor.setStyle(BASE, 'border-top-width', this.em(t * this.font.params.rule_factor));
                }
                this.addRoot(ROOT, root, sbox, H);
                surd.toCHTML([SURD]);
                base.toCHTML([BASE]);
                if (surd.size < 0) {
                    adaptor.addClass(SQRT, 'mjx-tall');
                }
            }
            addRoot(_ROOT, _root, _sbox, _H) { }
        },
        _a.kind = MmlMsqrt.prototype.kind,
        _a.styles = {
            'mjx-root': {
                display: 'inline-block',
                'white-space': 'nowrap',
            },
            'mjx-surd': {
                display: 'inline-block',
                'vertical-align': 'top',
            },
            'mjx-sqrt': {
                display: 'inline-block',
                'padding-top': '.075em',
            },
            'mjx-sqrt > mjx-box': {
                'border-top': '.075em solid',
                'padding-left': '.03em',
                'margin-left': '-.03em',
            },
            'mjx-sqrt.mjx-tall > mjx-box': {
                'padding-left': '.3em',
                'margin-left': '-.3em',
            },
        },
        _a;
})();
//# sourceMappingURL=msqrt.js.map