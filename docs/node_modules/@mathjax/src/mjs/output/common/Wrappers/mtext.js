import { LineBBox } from '../LineBBox.js';
export function CommonMtextMixin(Base) {
    var _a;
    return _a = class CommonMtextMixin extends Base {
            constructor() {
                super(...arguments);
                this.breakPoints = [];
            }
            textWidth(text) {
                let textNode = this.textNode;
                if (!textNode) {
                    const text = this.node.factory.create('text');
                    text.parent = this.node;
                    textNode = this.textNode = this.factory.wrap(text);
                    textNode.parent = this;
                }
                textNode.node.setText(text);
                textNode.invalidateBBox(false);
                return textNode.getBBox().w;
            }
            get breakCount() {
                return this.breakPoints.length;
            }
            getVariant() {
                const options = this.jax.options;
                const data = this.jax.math.outputData;
                const merror = (!!data.merrorFamily || !!options.merrorFont) &&
                    this.node.Parent.isKind('merror');
                if (!!data.mtextFamily || !!options.mtextFont || merror) {
                    const variant = this.node.attributes.get('mathvariant');
                    const font = this.constructor.INHERITFONTS[variant] ||
                        this.jax.font.getCssFont(variant);
                    const family = font[0] ||
                        (merror
                            ? data.merrorFamily || options.merrorFont
                            : data.mtextFamily || options.mtextFont);
                    this.variant = this.explicitVariant(family, font[2] ? 'bold' : '', font[1] ? 'italic' : '');
                    return;
                }
                super.getVariant();
            }
            setBreakAt(ij) {
                this.breakPoints.push(ij);
            }
            clearBreakPoints() {
                this.breakPoints = [];
            }
            computeLineBBox(i) {
                const bbox = LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
                if (!this.breakCount)
                    return bbox;
                bbox.w = this.getBreakWidth(i);
                if (i === 0) {
                    bbox.R = 0;
                    this.addLeftBorders(bbox);
                }
                else {
                    bbox.L = 0;
                    bbox.indentData = [
                        ['left', '0'],
                        ['left', '0'],
                        ['left', '0'],
                    ];
                    if (i === this.breakCount) {
                        this.addRightBorders(bbox);
                    }
                }
                return bbox;
            }
            getBreakWidth(i) {
                const childNodes = this.childNodes;
                let [si, sj] = this.breakPoints[i - 1] || [0, 0];
                const [ei, ej] = this.breakPoints[i] || [childNodes.length, 0];
                let words = childNodes[si].node.getText().split(/ /);
                if (si === ei) {
                    return this.textWidth(words.slice(sj, ej).join(' '));
                }
                let w = this.textWidth(words.slice(sj).join(' '));
                while (++si < ei && si < childNodes.length) {
                    w += childNodes[si].getBBox().w;
                }
                if (si < childNodes.length) {
                    words = childNodes[si].node.getText().split(/ /);
                    w += this.textWidth(words.slice(0, ej).join(' '));
                }
                return w;
            }
        },
        _a.INHERITFONTS = {
            normal: ['', false, false],
            bold: ['', false, true],
            italic: ['', true, false],
            'bold-italic': ['', true, true],
        },
        _a;
}
//# sourceMappingURL=mtext.js.map