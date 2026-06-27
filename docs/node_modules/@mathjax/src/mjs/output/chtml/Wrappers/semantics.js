import { ChtmlWrapper } from '../Wrapper.js';
import { CommonSemanticsMixin, } from '../../common/Wrappers/semantics.js';
import { CommonXmlNodeMixin, } from '../../common/Wrappers/XmlNode.js';
import { MmlSemantics, MmlAnnotation, MmlAnnotationXML, } from '../../../core/MmlTree/MmlNodes/semantics.js';
import { XMLNode } from '../../../core/MmlTree/MmlNode.js';
export const ChtmlSemantics = (function () {
    var _a;
    const Base = CommonSemanticsMixin(ChtmlWrapper);
    return _a = class ChtmlSemantics extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                const chtml = this.standardChtmlNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toCHTML(chtml);
                }
            }
        },
        _a.kind = MmlSemantics.prototype.kind,
        _a;
})();
export const ChtmlAnnotation = (function () {
    var _a;
    return _a = class ChtmlAnnotation extends ChtmlWrapper {
            toCHTML(parents) {
                super.toCHTML(parents);
            }
            computeBBox() {
                return this.bbox;
            }
        },
        _a.kind = MmlAnnotation.prototype.kind,
        _a;
})();
export const ChtmlAnnotationXML = (function () {
    var _a;
    return _a = class ChtmlAnnotationXML extends ChtmlWrapper {
        },
        _a.kind = MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'mjx-annotation-xml': {
                'font-family': 'initial',
                'line-height': 'normal',
            },
        },
        _a;
})();
export const ChtmlXmlNode = (function () {
    var _a;
    const Base = CommonXmlNodeMixin(ChtmlWrapper);
    return _a = class ChtmlXmlNode extends Base {
            toCHTML(parents) {
                this.markUsed();
                this.dom = [this.adaptor.append(parents[0], this.getHTML())];
            }
            addHDW(html, styles) {
                const scale = this.jax.options.scale;
                const { h, d, w } = this.bbox;
                const rscale = scale * this.metrics.scale;
                styles.width = this.em(w * rscale);
                styles.height = this.em((h + d) * rscale);
                styles['vertical-align'] = this.em(-d * rscale);
                styles.position = 'relative';
                return this.html('mjx-html-holder', {
                    style: {
                        transform: `scale(${this.jax.fixed(scale)})`,
                        'transform-origin': 'top left',
                    },
                }, [html]);
            }
        },
        _a.kind = XMLNode.prototype.kind,
        _a;
})();
//# sourceMappingURL=semantics.js.map