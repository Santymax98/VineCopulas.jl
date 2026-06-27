import { CommonOutputJax } from './common.js';
import { StyleJsonSheet } from '../util/StyleJson.js';
import { ChtmlWrapperFactory } from './chtml/WrapperFactory.js';
import { Usage } from './chtml/Usage.js';
import * as LENGTHS from '../util/lengths.js';
import { unicodeChars } from '../util/string.js';
import { DefaultFont } from './chtml/DefaultFont.js';
export class CHTML extends CommonOutputJax {
    constructor(options = {}) {
        super(options, ChtmlWrapperFactory, DefaultFont);
        this.chtmlStyles = null;
        this.font.adaptiveCSS(this.options.adaptiveCSS);
        this.wrapperUsage = new Usage();
    }
    addExtension(font, prefix = '') {
        const css = super.addExtension(font, prefix);
        if (css.length && this.options.adaptiveCSS && this.chtmlStyles) {
            this.adaptor.insertRules(this.chtmlStyles, css);
        }
        return [];
    }
    escaped(math, html) {
        this.setDocument(html);
        return this.html('span', {}, [this.text(math.math)]);
    }
    styleSheet(html) {
        if (this.chtmlStyles) {
            const styles = new StyleJsonSheet();
            if (this.options.adaptiveCSS) {
                this.addWrapperStyles(styles);
                this.updateFontStyles(styles);
            }
            styles.addStyles(this.font.updateDynamicStyles());
            this.adaptor.insertRules(this.chtmlStyles, styles.getStyleRules());
            return this.chtmlStyles;
        }
        const sheet = (this.chtmlStyles = super.styleSheet(html));
        this.adaptor.setAttribute(sheet, 'id', CHTML.STYLESHEETID);
        this.wrapperUsage.update();
        return sheet;
    }
    updateFontStyles(styles) {
        styles.addStyles(this.font.updateStyles({}));
    }
    addWrapperStyles(styles) {
        if (!this.options.adaptiveCSS) {
            super.addWrapperStyles(styles);
            return;
        }
        for (const kind of this.wrapperUsage.update()) {
            const wrapper = this.factory.getNodeClass(kind);
            if (wrapper) {
                this.addClassStyles(wrapper, styles);
            }
        }
    }
    addClassStyles(wrapper, styles) {
        const CLASS = wrapper;
        if (CLASS.autoStyle && CLASS.kind !== 'unknown') {
            styles.addStyles({
                ['mjx-' + CLASS.kind]: {
                    display: 'inline-block',
                    'text-align': 'left',
                },
            });
        }
        this.wrapperUsage.add(CLASS.kind);
        super.addClassStyles(wrapper, styles);
    }
    insertStyles(styles) {
        if (this.chtmlStyles) {
            this.adaptor.insertRules(this.chtmlStyles, new StyleJsonSheet(styles).getStyleRules());
        }
    }
    processMath(wrapper, parent) {
        wrapper.toCHTML([parent]);
    }
    clearCache() {
        this.styleJson.clear();
        this.font.clearCache();
        this.wrapperUsage.clear();
        this.chtmlStyles = null;
    }
    reset() {
        this.clearCache();
    }
    unknownText(text, variant, width = null) {
        const styles = {};
        const scale = 100 / this.math.metrics.scale;
        if (scale !== 100) {
            styles['font-size'] = this.fixed(scale, 1) + '%';
            styles.padding =
                LENGTHS.em(75 / scale) + ' 0 ' + LENGTHS.em(20 / scale) + ' 0';
        }
        if (variant !== '-explicitFont') {
            const c = unicodeChars(text);
            if (c.length !== 1 || c[0] < 0x1d400 || c[0] > 0x1d7ff) {
                this.cssFontStyles(this.font.getCssFont(variant), styles);
            }
        }
        if (width !== null) {
            styles.width = this.fixed(width * this.math.metrics.scale) + 'em';
        }
        return this.html('mjx-utext', { variant: variant, style: styles }, [
            this.text(text),
        ]);
    }
    measureTextNode(textNode) {
        const adaptor = this.adaptor;
        const text = adaptor.clone(textNode);
        adaptor.setStyle(text, 'font-family', adaptor.getStyle(text, 'font-family').replace(/MJXZERO, /g, ''));
        const em = this.math.metrics.em;
        const style = {
            position: 'absolute',
            top: 0,
            left: 0,
            'white-space': 'nowrap',
            'font-size': this.fixed(em, 3) + 'px',
        };
        const node = this.html('mjx-measure-text', { style }, [text]);
        adaptor.append(adaptor.parent(this.math.start.node), this.container);
        adaptor.append(this.container, node);
        const w = adaptor.nodeSize(text, em)[0];
        adaptor.remove(this.container);
        adaptor.remove(node);
        return { w: w, h: 0.75, d: 0.2 };
    }
}
CHTML.NAME = 'CHTML';
CHTML.OPTIONS = Object.assign(Object.assign({}, CommonOutputJax.OPTIONS), { adaptiveCSS: true, matchFontHeight: true });
CHTML.commonStyles = Object.assign(Object.assign({}, CommonOutputJax.commonStyles), { 'mjx-container[jax="CHTML"]': {
        'white-space': 'nowrap',
    }, [[
        'mjx-mo > mjx-c',
        'mjx-mi > mjx-c',
        'mjx-mn > mjx-c',
        'mjx-ms > mjx-c',
        'mjx-mtext > mjx-c',
    ].join(', ')]: {
        'clip-path': 'padding-box polygon(' +
            [
                '-1em -2px',
                'calc(100% + 1em) -2px',
                'calc(100% + 1em) calc(100% + 2px)',
                '-1em calc(100% + 2px)',
            ].join(', ') +
            ')',
    }, 'mjx-stretchy-h': {
        'clip-path': 'padding-box polygon(0 -2px, 100% -2px, 100% calc(100% + 2px), 0 calc(100% + 2px))',
    }, 'mjx-stretchy-v': {
        'clip-path': 'padding-box polygon(-2px 0, calc(100% + 2px) 0, calc(100% + 2px) 100%, -2px 100%)',
    }, 'mjx-container [space="1"]': { 'margin-left': '.111em' }, 'mjx-container [space="2"]': { 'margin-left': '.167em' }, 'mjx-container [space="3"]': { 'margin-left': '.222em' }, 'mjx-container [space="4"]': { 'margin-left': '.278em' }, 'mjx-container [space="5"]': { 'margin-left': '.333em' }, 'mjx-container [rspace="1"]': { 'margin-right': '.111em' }, 'mjx-container [rspace="2"]': { 'margin-right': '.167em' }, 'mjx-container [rspace="3"]': { 'margin-right': '.222em' }, 'mjx-container [rspace="4"]': { 'margin-right': '.278em' }, 'mjx-container [rspace="5"]': { 'margin-right': '.333em' }, 'mjx-container [size="s"]': { 'font-size': '70.7%' }, 'mjx-container [size="ss"]': { 'font-size': '50%' }, 'mjx-container [size="Tn"]': { 'font-size': '60%' }, 'mjx-container [size="sm"]': { 'font-size': '85%' }, 'mjx-container [size="lg"]': { 'font-size': '120%' }, 'mjx-container [size="Lg"]': { 'font-size': '144%' }, 'mjx-container [size="LG"]': { 'font-size': '173%' }, 'mjx-container [size="hg"]': { 'font-size': '207%' }, 'mjx-container [size="HG"]': { 'font-size': '249%' }, 'mjx-container [width="full"]': { width: '100%' }, 'mjx-box': { display: 'inline-block' }, 'mjx-block': { display: 'block' }, 'mjx-itable': { display: 'inline-table' }, 'mjx-row': { display: 'table-row' }, [['cell', 'base', 'under', 'over', 'den']
        .map((node) => `mjx-row > mjx-${node}`)
        .join(', ')]: { display: 'table-cell' }, 'mjx-container [inline-breaks]': { display: 'inline' }, 'mjx-container .mjx-selected': {
        outline: '2px solid black',
    }, '@media (prefers-color-scheme: dark)': {
        'mjx-container .mjx-selected': {
            outline: '2px solid #C8C8C8',
        },
    }, 'mjx-mtext': {
        display: 'inline-block',
    }, 'mjx-mstyle': {
        display: 'inline-block',
    }, 'mjx-merror': {
        display: 'inline-block',
        color: 'red',
        'background-color': 'yellow',
    }, 'mjx-mphantom': {
        visibility: 'hidden',
    } });
CHTML.STYLESHEETID = 'MJX-CHTML-styles';
//# sourceMappingURL=chtml.js.map