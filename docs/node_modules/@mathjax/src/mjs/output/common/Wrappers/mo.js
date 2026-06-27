import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import { BBox } from '../../../util/BBox.js';
import { LineBBox } from '../LineBBox.js';
import { unicodeChars } from '../../../util/string.js';
import { DIRECTION, NOSTRETCH } from '../FontData.js';
export function CommonMoMixin(Base) {
    return class CommonMoMixin extends Base {
        get breakCount() {
            return this.breakStyle ? 1 : 0;
        }
        get embellishedBreakCount() {
            return this.embellishedBreakStyle ? 1 : 0;
        }
        get embellishedBreakStyle() {
            return this.breakStyle || this.getBreakStyle();
        }
        protoBBox(bbox) {
            const stretchy = this.stretch.dir !== DIRECTION.None;
            if (stretchy && this.size === null) {
                this.getStretchedVariant([0]);
            }
            if (stretchy && this.size < 0)
                return;
            super.computeBBox(bbox);
            if (bbox.w === 0 &&
                this.node.attributes.hasExplicit('fence') &&
                this.node.getText() === '' &&
                (this.node.texClass === TEXCLASS.OPEN ||
                    this.node.texClass === TEXCLASS.CLOSE) &&
                !this.jax.options.mathmlSpacing) {
                bbox.R = this.font.params.nulldelimiterspace;
            }
            this.copySkewIC(bbox);
        }
        getAccentOffset() {
            const bbox = BBox.empty();
            this.protoBBox(bbox);
            return -bbox.w / 2;
        }
        getCenterOffset(bbox = null) {
            if (!bbox) {
                bbox = BBox.empty();
                super.computeBBox(bbox);
            }
            return (bbox.h + bbox.d) / 2 + this.font.params.axis_height - bbox.h;
        }
        getStretchedVariant(WH, exact = false) {
            if (this.stretch.dir === DIRECTION.None) {
                return;
            }
            let D = this.getWH(WH);
            const min = this.getSize('minsize', 0);
            const max = this.getSize('maxsize', Infinity);
            const mathaccent = this.node.getProperty('mathaccent');
            D = Math.max(min, Math.min(max, D));
            const df = this.font.params.delimiterfactor / 1000;
            const ds = this.font.params.delimitershortfall;
            const m = min || exact
                ? D
                : mathaccent
                    ? Math.min(D / df, D + ds)
                    : Math.max(D * df, D - ds);
            const C = this.getText().codePointAt(0);
            let delim = this.stretch;
            if (this.size) {
                this.stretch = delim = this.font.getDelimiter(C);
                this.size = null;
            }
            const c = delim.c || C;
            let i = 0;
            if (delim.sizes) {
                for (const d of delim.sizes) {
                    if (d >= m) {
                        if (mathaccent && i) {
                            i--;
                        }
                        this.setDelimSize(c, i);
                        return;
                    }
                    i++;
                }
            }
            if (delim.stretch) {
                this.size = -1;
                this.invalidateBBox();
                this.getStretchBBox(WH, this.checkExtendedHeight(D, delim), delim);
            }
            else {
                this.setDelimSize(c, i - 1);
            }
        }
        setDelimSize(c, i) {
            const delim = this.stretch;
            this.variant = this.font.getSizeVariant(c, i);
            this.size = i;
            const schar = delim.schar
                ? delim.schar[Math.min(i, delim.schar.length - 1)] || c
                : c;
            this.stretch = Object.assign(Object.assign({}, delim), { c: schar });
            this.childNodes[0].invalidateBBox();
        }
        getSize(name, value) {
            const attributes = this.node.attributes;
            if (attributes.isSet(name)) {
                value = this.length2em(attributes.get(name), 1, 1);
            }
            return value;
        }
        getWH(WH) {
            if (WH.length === 0)
                return 0;
            if (WH.length === 1)
                return WH[0];
            const [H, D] = WH;
            const a = this.font.params.axis_height;
            return this.node.attributes.get('symmetric')
                ? 2 * Math.max(H - a, D + a)
                : H + D;
        }
        getStretchBBox(WHD, D, C) {
            if (Object.hasOwn(C, 'min') && C.min > D) {
                D = C.min;
            }
            let [h, d, w] = C.HDW;
            if (this.stretch.dir === DIRECTION.Vertical) {
                [h, d] = this.getBaseline(WHD, D, C);
            }
            else {
                w = D;
                if (this.stretch.hd && !this.jax.options.mathmlSpacing) {
                    const t = this.font.params.extender_factor;
                    h = h * (1 - t) + this.stretch.hd[0] * t;
                    d = d * (1 - t) + this.stretch.hd[1] * t;
                }
            }
            this.bbox.h = h;
            this.bbox.d = d;
            this.bbox.w = w;
        }
        getBaseline(WHD, HD, C) {
            const hasWHD = WHD.length === 2 && WHD[0] + WHD[1] === HD;
            const symmetric = this.node.attributes.get('symmetric');
            const [H, D] = hasWHD ? WHD : [HD, 0];
            let [h, d] = [H + D, 0];
            if (symmetric) {
                const a = this.font.params.axis_height;
                if (hasWHD) {
                    h = 2 * Math.max(H - a, D + a);
                }
                d = h / 2 - a;
            }
            else if (hasWHD) {
                d = D;
            }
            else {
                const [ch, cd] = C.HDW || [0.75, 0.25];
                d = cd * (h / (ch + cd));
            }
            return [h - d, d];
        }
        checkExtendedHeight(D, C) {
            if (C.fullExt) {
                const [extSize, endSize] = C.fullExt;
                const n = Math.ceil(Math.max(0, D - endSize) / extSize);
                D = endSize + n * extSize;
            }
            return D;
        }
        setBreakStyle(linebreak = '') {
            var _a;
            this.breakStyle =
                ((_a = this.node.parent) === null || _a === void 0 ? void 0 : _a.isEmbellished) && !linebreak
                    ? ''
                    : this.getBreakStyle(linebreak);
            if (!this.breakCount)
                return;
            if (this.multChar) {
                const i = this.parent.node.childIndex(this.node);
                const next = this.parent.node.childNodes[i + 1];
                if (next) {
                    next.setTeXclass(this.multChar.node);
                }
            }
        }
        getBreakStyle(linebreak = '') {
            const attributes = this.node.attributes;
            let style = linebreak ||
                (attributes.get('linebreak') === 'newline' ||
                    this.node.getProperty('forcebreak')
                    ? attributes.get('linebreakstyle')
                    : '');
            if (style === 'infixlinebreakstyle') {
                style = attributes.get(style);
            }
            return style;
        }
        getMultChar() {
            const multChar = this.node.attributes.get('linebreakmultchar');
            if (multChar && this.getText() === '\u2062' && multChar !== '\u2062') {
                this.multChar = this.createMo(multChar);
            }
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.size = null;
            this.isAccent = this.node.isAccent;
            this.getMultChar();
            this.setBreakStyle();
        }
        computeBBox(bbox, _recompute = false) {
            this.protoBBox(bbox);
            if (this.node.attributes.get('symmetric') &&
                this.stretch.dir !== DIRECTION.Horizontal) {
                const d = this.getCenterOffset(bbox);
                bbox.h += d;
                bbox.d -= d;
            }
            if (this.node.getProperty('mathaccent') &&
                (this.stretch.dir === DIRECTION.None || this.size >= 0)) {
                bbox.w = 0;
            }
        }
        computeLineBBox(i) {
            return this.moLineBBox(i, this.breakStyle);
        }
        moLineBBox(i, style, obox = null) {
            const leadingString = this.node.attributes.get('lineleading');
            const leading = this.length2em(leadingString, this.linebreakOptions.lineleading);
            if (i === 0 && style === 'before') {
                const bbox = LineBBox.from(BBox.zero(), leading);
                bbox.originalL = this.bbox.L;
                this.bbox.L = 0;
                return bbox;
            }
            let bbox = LineBBox.from(obox || this.getOuterBBox(), leading);
            if (i === 1) {
                if (style === 'after') {
                    bbox.w = bbox.h = bbox.d = 0;
                    bbox.isFirst = true;
                    this.bbox.R = 0;
                }
                else if (style === 'duplicate') {
                    bbox.L = 0;
                }
                else if (this.multChar) {
                    bbox = LineBBox.from(this.multChar.getOuterBBox(), leading);
                }
                bbox.getIndentData(this.node);
            }
            return bbox;
        }
        canStretch(direction) {
            if (this.stretch.dir !== DIRECTION.None) {
                return this.stretch.dir === direction;
            }
            const attributes = this.node.attributes;
            if (!attributes.get('stretchy'))
                return false;
            const c = this.getText();
            if (Array.from(c).length !== 1)
                return false;
            const delim = this.font.getDelimiter(c.codePointAt(0));
            this.stretch = (delim && delim.dir === direction ? delim : NOSTRETCH);
            return this.stretch.dir !== DIRECTION.None;
        }
        getVariant() {
            if (this.node.attributes.get('largeop')) {
                this.variant = this.node.attributes.get('displaystyle')
                    ? '-largeop'
                    : '-smallop';
                return;
            }
            if (!this.node.attributes.hasExplicit('mathvariant') &&
                this.node.getProperty('pseudoscript') === false) {
                this.variant = '-tex-variant';
                return;
            }
            super.getVariant();
        }
        remapChars(chars) {
            const primes = this.node.getProperty('primes');
            if (primes) {
                return unicodeChars(primes);
            }
            if (chars.length === 1) {
                const parent = this.node.coreParent().parent;
                const isAccent = this.isAccent && !parent.isKind('mrow');
                const map = isAccent ? 'accent' : 'mo';
                const text = this.font.getRemappedChar(map, chars[0]);
                if (text) {
                    chars = this.unicodeChars(text, this.variant);
                }
            }
            return chars;
        }
    };
}
//# sourceMappingURL=mo.js.map