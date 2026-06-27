import { ChtmlWrapper } from '../Wrapper.js';
import { CommonScriptbaseMixin, } from '../../common/Wrappers/scriptbase.js';
import { ChtmlMsubsup } from './msubsup.js';
export const ChtmlScriptbase = (function () {
    var _a;
    const Base = CommonScriptbaseMixin(ChtmlWrapper);
    return _a = class ChtmlScriptbase extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                this.dom = this.standardChtmlNodes(parents);
                const [x, v] = this.getOffset();
                const dx = x - (this.baseRemoveIc ? this.baseIc : 0);
                const style = { 'vertical-align': this.em(v) };
                if (dx) {
                    style['margin-left'] = this.em(dx);
                }
                this.baseChild.toCHTML(this.dom);
                const dom = this.dom[this.dom.length - 1];
                this.scriptChild.toCHTML([
                    this.adaptor.append(dom, this.html('mjx-script', { style })),
                ]);
            }
            markUsed() {
                super.markUsed();
                this.jax.wrapperUsage.add(ChtmlMsubsup.kind);
            }
            setDeltaW(nodes, dx) {
                for (let i = 0; i < dx.length; i++) {
                    if (dx[i]) {
                        this.adaptor.setStyle(nodes[i], 'paddingLeft', this.em(dx[i]));
                    }
                }
            }
            adjustOverDepth(over, overbox) {
                if (overbox.d >= 0)
                    return;
                this.adaptor.setStyle(over, 'marginBottom', this.em(overbox.d * overbox.rscale));
            }
            adjustUnderDepth(under, underbox) {
                if (underbox.d >= 0)
                    return;
                const adaptor = this.adaptor;
                const v = this.em(underbox.d);
                const box = this.html('mjx-box', {
                    style: { 'margin-bottom': v, 'vertical-align': v },
                });
                for (const child of adaptor.childNodes(adaptor.firstChild(under))) {
                    adaptor.append(box, child);
                }
                adaptor.append(adaptor.firstChild(under), box);
            }
            adjustBaseHeight(base, basebox) {
                if (this.node.attributes.get('accent')) {
                    const minH = this.font.params.x_height * this.baseScale;
                    if (basebox.h < minH) {
                        this.adaptor.setStyle(base, 'paddingTop', this.em(minH - basebox.h));
                        basebox.h = minH;
                    }
                }
            }
        },
        _a.kind = 'scriptbase',
        _a;
})();
//# sourceMappingURL=scriptbase.js.map