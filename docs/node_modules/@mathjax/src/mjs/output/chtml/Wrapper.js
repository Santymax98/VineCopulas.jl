import { CommonWrapper, SPACE, } from '../common/Wrapper.js';
import { BBox } from '../../util/BBox.js';
export const FONTSIZE = {
    '70.7%': 's',
    '70%': 's',
    '50%': 'ss',
    '60%': 'Tn',
    '85%': 'sm',
    '120%': 'lg',
    '144%': 'Lg',
    '173%': 'LG',
    '207%': 'hg',
    '249%': 'HG',
};
export class ChtmlWrapper extends CommonWrapper {
    toCHTML(parents) {
        if (this.toEmbellishedCHTML(parents))
            return;
        this.addChildren(this.standardChtmlNodes(parents));
    }
    toEmbellishedCHTML(parents) {
        if (parents.length <= 1 || !this.node.isEmbellished)
            return false;
        const adaptor = this.adaptor;
        parents.forEach((dom) => adaptor.append(dom, this.html('mjx-linestrut')));
        const style = this.coreMO().embellishedBreakStyle;
        const dom = [];
        for (const [parent, STYLE] of [
            [parents[0], 'before'],
            [parents[1], 'after'],
        ]) {
            if (style !== STYLE) {
                this.toCHTML([parent]);
                dom.push(this.dom[0]);
                if (STYLE === 'after') {
                    adaptor.removeAttribute(this.dom[0], 'space');
                }
            }
            else {
                dom.push(this.createChtmlNodes([parent])[0]);
            }
        }
        this.dom = dom;
        return true;
    }
    addChildren(parents) {
        for (const child of this.childNodes) {
            child.toCHTML(parents);
        }
    }
    standardChtmlNodes(parents) {
        this.markUsed();
        const chtml = this.createChtmlNodes(parents);
        this.handleStyles();
        this.handleScale();
        this.handleBorders();
        this.handleColor();
        this.handleSpace();
        this.handleAttributes();
        this.handlePWidth();
        return chtml;
    }
    markUsed() {
        this.jax.wrapperUsage.add(this.kind);
    }
    createChtmlNodes(parents) {
        this.dom = parents.map((_parent) => this.html('mjx-' + this.node.kind));
        parents = this.handleHref(parents);
        for (const i of parents.keys()) {
            this.adaptor.append(parents[i], this.dom[i]);
        }
        return this.dom;
    }
    handleHref(parents) {
        const href = this.node.attributes.get('href');
        if (!href)
            return parents;
        return parents.map((parent) => this.adaptor.append(parent, this.html('a', { href: href })));
    }
    handleStyles() {
        if (!this.styles)
            return;
        const styles = this.styles.cssText;
        if (styles) {
            const adaptor = this.adaptor;
            this.dom.forEach((dom) => adaptor.setAttribute(dom, 'style', styles));
            const family = this.styles.get('font-family');
            if (family) {
                this.dom.forEach((dom) => adaptor.setStyle(dom, 'font-family', this.font.cssFamilyPrefix + ', ' + family));
            }
        }
    }
    handleScale() {
        this.dom.forEach((dom) => this.setScale(dom, this.bbox.rscale));
    }
    setScale(chtml, rscale) {
        const scale = Math.abs(rscale - 1) < 0.001 ? 1 : rscale;
        if (chtml && scale !== 1) {
            const size = this.percent(scale);
            if (FONTSIZE[size]) {
                this.adaptor.setAttribute(chtml, 'size', FONTSIZE[size]);
            }
            else {
                this.adaptor.setStyle(chtml, 'fontSize', size);
            }
        }
        return chtml;
    }
    handleSpace() {
        const adaptor = this.adaptor;
        const breakable = !!this.node.getProperty('breakable') && !this.node.getProperty('newline');
        const n = this.dom.length - 1;
        for (const data of [
            [this.getLineBBox(0).L, 'space', 'marginLeft', 0],
            [this.getLineBBox(n).R, 'rspace', 'marginRight', n],
        ]) {
            const [dimen, name, margin, i] = data;
            const space = this.em(dimen);
            if (breakable && name === 'space') {
                const node = adaptor.node('mjx-break', SPACE[space]
                    ? { size: SPACE[space] }
                    : { style: `letter-spacing: ${this.em(dimen - 1)}` }, [adaptor.text(' ')]);
                adaptor.insert(node, this.dom[i]);
            }
            else if (dimen) {
                if (SPACE[space]) {
                    adaptor.setAttribute(this.dom[i], name, SPACE[space]);
                }
                else {
                    adaptor.setStyle(this.dom[i], margin, space);
                }
            }
        }
    }
    handleBorders() {
        var _a, _b;
        const border = (_a = this.styleData) === null || _a === void 0 ? void 0 : _a.border;
        const padding = (_b = this.styleData) === null || _b === void 0 ? void 0 : _b.padding;
        const n = this.dom.length - 1;
        if (!border || !n)
            return;
        const adaptor = this.adaptor;
        for (const k of this.dom.keys()) {
            const dom = this.dom[k];
            if (k) {
                if (border.width[3]) {
                    adaptor.setStyle(dom, 'border-left', ' none');
                }
                if (padding[3]) {
                    adaptor.setStyle(dom, 'padding-left', '0');
                }
            }
            if (k !== n) {
                if (border.width[1]) {
                    adaptor.setStyle(dom, 'border-right', 'none');
                }
                if (padding[1]) {
                    adaptor.setStyle(dom, 'padding-right', '0');
                }
            }
        }
    }
    handleColor() {
        var _a;
        const adaptor = this.adaptor;
        const attributes = this.node.attributes;
        const color = (attributes.getExplicit('mathcolor') ||
            attributes.getExplicit('color'));
        const background = (attributes.getExplicit('mathbackground') ||
            attributes.getExplicit('background') ||
            ((_a = this.styles) === null || _a === void 0 ? void 0 : _a.get('background-color')));
        if (color) {
            this.dom.forEach((dom) => adaptor.setStyle(dom, 'color', color));
        }
        if (background) {
            this.dom.forEach((dom) => adaptor.setStyle(dom, 'backgroundColor', background));
        }
    }
    handleAttributes() {
        const adaptor = this.adaptor;
        const attributes = this.node.attributes;
        const defaults = attributes.getAllDefaults();
        const skip = ChtmlWrapper.skipAttributes;
        for (const name of attributes.getExplicitNames()) {
            if (skip[name] === false ||
                (!(name in defaults) &&
                    !skip[name] &&
                    !adaptor.hasAttribute(this.dom[0], name))) {
                const value = attributes.getExplicit(name);
                this.dom.forEach((dom) => adaptor.setAttribute(dom, name, value));
            }
        }
        if (attributes.get('class')) {
            const names = attributes.get('class').trim().split(/ +/);
            for (const name of names) {
                this.dom.forEach((dom) => adaptor.addClass(dom, name));
            }
        }
        if (this.node.getProperty('inline-breaks')) {
            this.dom.forEach((dom) => adaptor.setAttribute(dom, 'inline-breaks', 'true'));
        }
    }
    handlePWidth() {
        if (this.bbox.pwidth) {
            const adaptor = this.adaptor;
            if (this.bbox.pwidth === BBox.fullWidth) {
                this.dom.forEach((dom) => adaptor.setAttribute(dom, 'width', 'full'));
            }
            else {
                this.dom.forEach((dom) => adaptor.setStyle(dom, 'width', this.bbox.pwidth));
            }
        }
    }
    setIndent(chtml, align, shift) {
        const adaptor = this.adaptor;
        if (align === 'center' || align === 'left') {
            const L = this.getBBox().L;
            if (shift + L) {
                adaptor.setStyle(chtml, 'margin-left', this.em(shift + L));
            }
        }
        if (align === 'center' || align === 'right') {
            const R = this.getBBox().R;
            if (shift + R) {
                adaptor.setStyle(chtml, 'margin-right', this.em(-shift + R));
            }
        }
    }
    drawBBox() {
        const { w, h, d, R } = this.getOuterBBox();
        const box = this.html('mjx-box', {
            style: {
                opacity: 0.25,
                'margin-left': this.em(-w - R),
            },
        }, [
            this.html('mjx-box', {
                style: {
                    height: this.em(h),
                    width: this.em(w),
                    'background-color': 'red',
                },
            }),
            this.html('mjx-box', {
                style: {
                    height: this.em(d),
                    width: this.em(w),
                    'margin-left': this.em(-w),
                    'vertical-align': this.em(-d),
                    'background-color': 'green',
                },
            }),
        ]);
        const node = this.dom[0] || this.parent.dom[0];
        const size = this.adaptor.getAttribute(node, 'size');
        if (size) {
            this.adaptor.setAttribute(box, 'size', size);
        }
        const fontsize = this.adaptor.getStyle(node, 'fontSize');
        if (fontsize) {
            this.adaptor.setStyle(box, 'fontSize', fontsize);
        }
        this.adaptor.append(this.adaptor.parent(node), box);
        this.adaptor.setStyle(node, 'backgroundColor', '#FFEE00');
    }
    html(type, def = {}, content = []) {
        return this.jax.html(type, def, content);
    }
    text(text) {
        return this.jax.text(text);
    }
    char(n) {
        return this.font.charSelector(n).substring(1);
    }
}
ChtmlWrapper.kind = 'unknown';
ChtmlWrapper.autoStyle = true;
//# sourceMappingURL=Wrapper.js.map