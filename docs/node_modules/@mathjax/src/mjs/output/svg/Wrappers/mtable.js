import { SvgWrapper } from '../Wrapper.js';
import { CommonMtableMixin, } from '../../common/Wrappers/mtable.js';
import { MmlMtable } from '../../../core/MmlTree/MmlNodes/mtable.js';
const CLASSPREFIX = 'mjx-';
export const SvgMtable = (function () {
    var _a;
    const Base = CommonMtableMixin(SvgWrapper);
    return _a = class SvgMtable extends Base {
            placeRows(svg) {
                const equal = this.node.attributes.get('equalrows');
                const { H, D } = this.getTableData();
                const HD = this.getEqualRowHeight();
                const rSpace = this.getRowHalfSpacing();
                const rLines = [this.fLine, ...this.rLines, this.fLine];
                let y = this.getBBox().h - rLines[0];
                for (let i = 0; i < this.numRows; i++) {
                    const row = this.childNodes[i];
                    [row.H, row.D] = this.getRowHD(equal, HD, H[i], D[i]);
                    [row.tSpace, row.bSpace] = [rSpace[i], rSpace[i + 1]];
                    [row.tLine, row.bLine] = [rLines[i], rLines[i + 1]];
                    row.toSVG([svg]);
                    row.place(0, y - rSpace[i] - row.H);
                    y -= rSpace[i] + row.H + row.D + rSpace[i + 1] + rLines[i + 1];
                }
            }
            getRowHD(equal, HD, H, D) {
                return equal ? [(HD + H - D) / 2, (HD - H + D) / 2] : [H, D];
            }
            handleColor() {
                super.handleColor();
                const rect = this.firstChild();
                if (rect) {
                    this.adaptor.setAttribute(rect, 'width', this.fixed(this.getWidth()));
                }
            }
            handleColumnLines(svg) {
                if (this.node.attributes.get('columnlines') === 'none')
                    return;
                const lines = this.getColumnAttributes('columnlines');
                if (!lines)
                    return;
                const cSpace = this.getColumnHalfSpacing();
                const cLines = this.cLines;
                const cWidth = this.getComputedWidths();
                let x = this.fLine;
                for (let i = 0; i < lines.length; i++) {
                    x += cSpace[i] + cWidth[i] + cSpace[i + 1];
                    if (lines[i] !== 'none') {
                        this.adaptor.append(svg, this.makeVLine(x, lines[i], cLines[i]));
                    }
                    x += cLines[i];
                }
            }
            handleRowLines(svg) {
                if (this.node.attributes.get('rowlines') === 'none')
                    return;
                const lines = this.getRowAttributes('rowlines');
                if (!lines)
                    return;
                const equal = this.node.attributes.get('equalrows');
                const { H, D } = this.getTableData();
                const HD = this.getEqualRowHeight();
                const rSpace = this.getRowHalfSpacing();
                const rLines = this.rLines;
                let y = this.getBBox().h - this.fLine;
                for (let i = 0; i < lines.length; i++) {
                    const [rH, rD] = this.getRowHD(equal, HD, H[i], D[i]);
                    y -= rSpace[i] + rH + rD + rSpace[i + 1];
                    if (lines[i] !== 'none') {
                        this.adaptor.append(svg, this.makeHLine(y, lines[i], rLines[i]));
                    }
                    y -= rLines[i];
                }
            }
            handleFrame(svg) {
                if (this.frame && this.fLine) {
                    const { h, d, w } = this.getBBox();
                    const style = this.node.attributes.get('frame');
                    this.adaptor.append(svg, this.makeFrame(w, h, d, style));
                }
            }
            handlePWidth(svg) {
                if (!this.pWidth) {
                    return 0;
                }
                const { w, L, R } = this.getBBox();
                const W = L + this.pWidth + R;
                const align = this.getAlignShift()[0];
                const max = Math.max(this.isTop ? W : 0, this.container.getWrapWidth(this.containerI));
                const CW = max - L - R;
                const dw = w - (this.pWidth > CW ? CW : this.pWidth);
                const dx = align === 'left' ? 0 : align === 'right' ? dw : dw / 2;
                if (dx) {
                    const table = this.svg('g', {}, this.adaptor.childNodes(svg));
                    this.place(dx, 0, table);
                    this.adaptor.append(svg, table);
                }
                return dx;
            }
            lineClass(style) {
                return CLASSPREFIX + style;
            }
            makeFrame(w, h, d, style) {
                const t = this.fLine;
                return this.svg('rect', this.setLineThickness(t, style, {
                    'data-frame': true,
                    class: this.lineClass(style),
                    width: this.fixed(w - t),
                    height: this.fixed(h + d - t),
                    x: this.fixed(t / 2),
                    y: this.fixed(t / 2 - d),
                }));
            }
            makeVLine(x, style, t) {
                const { h, d } = this.getBBox();
                const dt = style === 'dotted' ? t / 2 : 0;
                const X = this.fixed(x + t / 2);
                return this.svg('line', this.setLineThickness(t, style, {
                    'data-line': 'v',
                    class: this.lineClass(style),
                    x1: X,
                    y1: this.fixed(dt - d),
                    x2: X,
                    y2: this.fixed(h - dt),
                }));
            }
            makeHLine(y, style, t) {
                const w = this.getBBox().w;
                const dt = style === 'dotted' ? t / 2 : 0;
                const Y = this.fixed(y - t / 2);
                return this.svg('line', this.setLineThickness(t, style, {
                    'data-line': 'h',
                    class: this.lineClass(style),
                    x1: this.fixed(dt),
                    y1: Y,
                    x2: this.fixed(w - dt),
                    y2: Y,
                }));
            }
            setLineThickness(t, style, properties) {
                if (t !== 0.07) {
                    properties['stroke-thickness'] = this.fixed(t);
                    if (style !== 'solid') {
                        properties['stroke-dasharray'] =
                            (style === 'dotted' ? '0,' : '') + this.fixed(2 * t);
                    }
                }
                return properties;
            }
            handleLabels(svg, _parent, dx) {
                if (!this.hasLabels)
                    return;
                const labels = this.labels;
                const attributes = this.node.attributes;
                const side = attributes.get('side');
                this.spaceLabels();
                this.isTop
                    ? this.topTable(svg, labels, side)
                    : this.subTable(svg, labels, side, dx);
            }
            spaceLabels() {
                const adaptor = this.adaptor;
                const h = this.getBBox().h;
                const L = this.getTableData().L;
                const space = this.getRowHalfSpacing();
                let y = h - this.fLine;
                let current = adaptor.firstChild(this.labels);
                for (let i = 0; i < this.numRows; i++) {
                    const row = this.childNodes[i];
                    if (row.node.isKind('mlabeledtr')) {
                        const cell = row.childNodes[0];
                        y -= space[i] + row.H;
                        row.placeCell(cell, {
                            x: 0,
                            y: y,
                            w: L,
                            lSpace: 0,
                            rSpace: 0,
                            lLine: 0,
                            rLine: 0,
                        });
                        y -= row.D + space[i + 1] + this.rLines[i];
                        current = adaptor.next(current);
                    }
                    else {
                        y -= space[i] + row.H + row.D + space[i + 1] + this.rLines[i];
                    }
                }
            }
            topTable(svg, labels, side) {
                const adaptor = this.adaptor;
                const { h, d, w, L, R } = this.getBBox();
                const W = L + (this.pWidth || w) + R;
                const LW = this.getTableData().L;
                const [, align, shift] = this.getPadAlignShift(side);
                const dx = shift + (align === 'right' ? -W : align === 'center' ? -W / 2 : 0) + L;
                const matrix = 'matrix(1 0 0 -1 0 0)';
                const scale = `scale(${this.jax.fixed((this.font.params.x_height * 1000) / this.metrics.ex, 2)})`;
                const transform = `translate(0 ${this.fixed(h)}) ${matrix} ${scale}`;
                const table = this.svg('svg', {
                    'data-table': true,
                    preserveAspectRatio: align === 'left'
                        ? 'xMinYMid'
                        : align === 'right'
                            ? 'xMaxYMid'
                            : 'xMidYMid',
                    viewBox: `${this.fixed(-dx)} ${this.fixed(-h)} 1 ${this.fixed(h + d)}`,
                }, [this.svg('g', { transform: matrix }, adaptor.childNodes(svg))]);
                labels = this.svg('svg', {
                    'data-labels': true,
                    preserveAspectRatio: side === 'left' ? 'xMinYMid' : 'xMaxYMid',
                    viewBox: [
                        side === 'left' ? 0 : this.fixed(LW),
                        this.fixed(-h),
                        1,
                        this.fixed(h + d),
                    ].join(' '),
                }, [labels]);
                adaptor.append(svg, this.svg('g', { transform: transform }, [table, labels]));
                this.place(-L, 0, svg);
            }
            subTable(svg, labels, side, dx) {
                const adaptor = this.adaptor;
                const { w, L, R } = this.getBBox();
                const W = L + (this.pWidth || w) + R;
                const labelW = this.getTableData().L;
                const align = this.getAlignShift()[0];
                const CW = Math.max(W, this.container.getWrapWidth(this.containerI));
                this.place(side === 'left'
                    ? (align === 'left'
                        ? 0
                        : align === 'right'
                            ? W - CW + dx
                            : (W - CW) / 2 + dx) - L
                    : (align === 'left'
                        ? CW
                        : align === 'right'
                            ? W + dx
                            : (CW + W) / 2 + dx) -
                        L -
                        labelW, 0, labels);
                adaptor.append(svg, labels);
            }
            constructor(factory, node, parent = null) {
                super(factory, node, parent);
                const def = { 'data-labels': true };
                if (this.isTop) {
                    def.transform = 'matrix(1 0 0 -1 0 0)';
                }
                this.labels = this.svg('g', def);
            }
            toSVG(parents) {
                const svg = this.standardSvgNodes(parents)[0];
                this.placeRows(svg);
                this.handleColumnLines(svg);
                this.handleRowLines(svg);
                this.handleFrame(svg);
                const dx = this.handlePWidth(svg);
                this.handleLabels(svg, parents[0], dx);
            }
        },
        _a.kind = MmlMtable.prototype.kind,
        _a.styles = {
            'g[data-mml-node="mtable"] > line[data-line], svg[data-table] > g > line[data-line]': {
                'stroke-width': '70px',
                fill: 'none',
            },
            'g[data-mml-node="mtable"] > rect[data-frame], svg[data-table] > g > rect[data-frame]': {
                'stroke-width': '70px',
                fill: 'none',
            },
            'g[data-mml-node="mtable"] > .mjx-dashed, svg[data-table] > g > .mjx-dashed': {
                'stroke-dasharray': '140',
            },
            'g[data-mml-node="mtable"] > .mjx-dotted, svg[data-table] > g > .mjx-dotted': {
                'stroke-linecap': 'round',
                'stroke-dasharray': '0,140',
            },
            'g[data-mml-node="mtable"] > g > svg': {
                overflow: 'visible',
            },
        },
        _a;
})();
//# sourceMappingURL=mtable.js.map