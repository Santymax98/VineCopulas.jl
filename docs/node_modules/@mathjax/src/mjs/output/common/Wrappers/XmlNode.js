import { split } from '../../../util/string.js';
export function CommonXmlNodeMixin(Base) {
    class CommonXmlNodeMixin extends Base {
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.rscale = this.getRScale();
        }
        computeBBox(bbox, _recompute = false) {
            const xml = this.node.getXML();
            const hdw = this.getHDW(xml, 'use', 'force');
            const { h, d, w } = hdw ? this.splitHDW(hdw) : this.measureXmlNode(xml);
            bbox.w = w;
            bbox.h = h;
            bbox.d = d;
        }
        getHTML() {
            const adaptor = this.adaptor;
            let html = adaptor.clone(this.node.getXML());
            const styles = this.getFontStyles();
            const hdw = this.getHDW(html, 'force');
            if (hdw || this.jax.options.scale !== 1) {
                html = this.addHDW(html, styles);
            }
            return this.html('mjx-html', { variant: this.parent.variant, style: styles }, [html]);
        }
        getHDW(xml, use, force = use) {
            const option = this.jax.options.htmlHDW;
            const hdw = this.adaptor.getAttribute(xml, 'data-mjx-hdw');
            return hdw && (option === use || option === force) ? hdw : null;
        }
        splitHDW(hdw) {
            const scale = 1 / this.metrics.scale;
            const [h, d, w] = split(hdw).map((x) => this.length2em(x || '0') * scale);
            return { h, d, w };
        }
        getFontStyles() {
            var _a;
            const adaptor = this.adaptor;
            const metrics = this.metrics;
            return {
                'font-family': ((_a = this.parent.styles) === null || _a === void 0 ? void 0 : _a.get('font-family')) ||
                    metrics.family ||
                    adaptor.fontFamily(adaptor.parent(this.jax.math.start.node)) ||
                    'initial',
                'font-size': this.jax.fixed(metrics.em * this.rscale) + 'px',
            };
        }
        measureXmlNode(xml) {
            const adaptor = this.adaptor;
            const content = this.html('mjx-xml-block', { style: { display: 'inline-block' } }, [adaptor.clone(xml)]);
            const base = this.html('mjx-baseline', {
                style: { display: 'inline-block', width: 0, height: 0 },
            });
            const style = this.getFontStyles();
            const node = this.html('mjx-measure-xml', { style }, [base, content]);
            const container = this.jax.container;
            adaptor.append(adaptor.parent(this.jax.math.start.node), container);
            adaptor.append(container, node);
            const metrics = this.metrics;
            const em = metrics.em * metrics.scale * this.rscale;
            const { left, right, bottom, top } = adaptor.nodeBBox(content);
            const w = (right - left) / em;
            const h = (adaptor.nodeBBox(base).top - top) / em;
            const d = (bottom - top) / em - h;
            adaptor.remove(container);
            adaptor.remove(node);
            return { w, h, d };
        }
        getStyles() { }
        getScale() { }
        getVariant() { }
    }
    CommonXmlNodeMixin.autoStyle = false;
    CommonXmlNodeMixin.styles = {
        'mjx-measure-xml': {
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'inline-block',
            'line-height': 'normal',
            'white-space': 'normal',
        },
        'mjx-html': {
            display: 'inline-block',
            'line-height': 'normal',
            'text-align': 'initial',
            'white-space': 'initial',
        },
        'mjx-html-holder': {
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
        },
    };
    return CommonXmlNodeMixin;
}
//# sourceMappingURL=XmlNode.js.map