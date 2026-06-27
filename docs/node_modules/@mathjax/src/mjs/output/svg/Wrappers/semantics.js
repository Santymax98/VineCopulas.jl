import { SvgWrapper } from '../Wrapper.js';
import { CommonSemanticsMixin, } from '../../common/Wrappers/semantics.js';
import { CommonXmlNodeMixin, } from '../../common/Wrappers/XmlNode.js';
import { MmlSemantics, MmlAnnotation, MmlAnnotationXML, } from '../../../core/MmlTree/MmlNodes/semantics.js';
import { XMLNode } from '../../../core/MmlTree/MmlNode.js';
export const SvgSemantics = (function () {
    var _a;
    const Base = CommonSemanticsMixin(SvgWrapper);
    return _a = class SvgSemantics extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toSVG(svg);
                }
            }
        },
        _a.kind = MmlSemantics.prototype.kind,
        _a;
})();
export const SvgAnnotation = (function () {
    var _a;
    return _a = class SvgAnnotation extends SvgWrapper {
            toSVG(parents) {
                super.toSVG(parents);
            }
            computeBBox() {
                return this.bbox;
            }
        },
        _a.kind = MmlAnnotation.prototype.kind,
        _a;
})();
export const SvgAnnotationXML = (function () {
    var _a;
    return _a = class SvgAnnotationXML extends SvgWrapper {
        },
        _a.kind = MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'foreignObject[data-mjx-xml]': {
                'font-family': 'initial',
                'line-height': 'normal',
                overflow: 'visible',
            },
        },
        _a;
})();
export const SvgXmlNode = (function () {
    var _a;
    const Base = CommonXmlNodeMixin(SvgWrapper);
    return _a = class SvgXmlNode extends Base {
            toSVG(parents) {
                const metrics = this.jax.math.metrics;
                const em = metrics.em * metrics.scale * this.rscale;
                const scale = this.fixed(1 / em, 3);
                const { w, h, d } = this.getBBox();
                this.dom = [
                    this.adaptor.append(parents[0], this.svg('foreignObject', {
                        'data-mjx-xml': true,
                        y: this.jax.fixed(-h * em) + 'px',
                        width: this.jax.fixed(w * em) + 'px',
                        height: this.jax.fixed((h + d) * em) + 'px',
                        transform: `scale(${scale}) matrix(1 0 0 -1 0 0)`,
                    }, [this.getHTML()])),
                ];
            }
            addHDW(html, styles) {
                html = this.html('mjx-html-holder', { style: styles }, [html]);
                const { h, d, w } = this.getBBox();
                const scale = this.metrics.scale;
                styles.height = this.em((h + d) * scale);
                styles.width = this.em(w * scale);
                styles['vertical-align'] = this.em(-d * scale);
                delete styles['font-size'];
                delete styles['font-family'];
                return html;
            }
        },
        _a.kind = XMLNode.prototype.kind,
        _a.styles = Object.assign({ 'foreignObject[data-mjx-html]': {
                overflow: 'visible',
            } }, Base.styles),
        _a;
})();
//# sourceMappingURL=semantics.js.map