import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMtableMixin, } from '../../common/Wrappers/mtable.js';
import { MmlMtable } from '../../../core/MmlTree/MmlNodes/mtable.js';
import { isPercent } from '../../../util/string.js';
export const ChtmlMtable = (function () {
    var _a;
    const Base = CommonMtableMixin(ChtmlWrapper);
    return _a = class ChtmlMtable extends Base {
            constructor(factory, node, parent = null) {
                super(factory, node, parent);
                this.itable = this.html('mjx-itable');
                this.labels = this.html('mjx-itable');
            }
            getAlignShift() {
                const data = super.getAlignShift();
                if (!this.isTop) {
                    data[1] = 0;
                }
                return data;
            }
            toCHTML(parents) {
                const chtml = this.standardChtmlNodes(parents);
                this.adaptor.append(chtml[0], this.html('mjx-table', {}, [this.itable]));
                for (const child of this.childNodes) {
                    child.toCHTML([this.itable]);
                }
                this.padRows();
                this.handleColumnSpacing();
                this.handleColumnLines();
                this.handleColumnWidths();
                this.handleRowSpacing();
                this.handleRowLines();
                this.handleRowHeights();
                this.handleFrame();
                this.handleWidth();
                this.handleLabels();
                this.handleAlign();
                this.handleJustify();
                this.shiftColor();
            }
            shiftColor() {
                const adaptor = this.adaptor;
                const color = adaptor.getStyle(this.dom[0], 'backgroundColor');
                if (color) {
                    adaptor.setStyle(this.dom[0], 'backgroundColor', '');
                    adaptor.setStyle(this.itable, 'backgroundColor', color);
                }
            }
            padRows() {
                const adaptor = this.adaptor;
                for (const row of adaptor.childNodes(this.itable)) {
                    while (adaptor.childNodes(row).length < this.numCols) {
                        adaptor.append(row, this.html('mjx-mtd', { extra: true }));
                    }
                }
            }
            handleColumnSpacing() {
                const scale = this.childNodes[0]
                    ? 1 / this.childNodes[0].getBBox().rscale
                    : 1;
                const spacing = this.getEmHalfSpacing([this.fSpace[0], this.fSpace[2]], this.cSpace, scale);
                for (const row of this.tableRows) {
                    let i = 0;
                    for (const cell of row.tableCells) {
                        const lspace = spacing[i++];
                        const rspace = spacing[i];
                        const styleNode = cell
                            ? cell.dom[0]
                            : this.adaptor.childNodes(row.dom[0])[i];
                        if ((i > 1 && lspace !== '0.4em') || (lspace !== '0' && i === 1)) {
                            this.adaptor.setStyle(styleNode, 'paddingLeft', lspace);
                        }
                        if ((i < this.numCols && rspace !== '0.4em') ||
                            (rspace !== '0' && i === this.numCols)) {
                            this.adaptor.setStyle(styleNode, 'paddingRight', rspace);
                        }
                    }
                }
            }
            handleColumnLines() {
                if (this.node.attributes.get('columnlines') === 'none')
                    return;
                const lines = this.getColumnAttributes('columnlines');
                for (const row of this.childNodes) {
                    let i = 0;
                    const cells = this.adaptor.childNodes(row.dom[0]).slice(1);
                    for (const cell of cells) {
                        const line = lines[i++];
                        if (line === 'none')
                            continue;
                        this.adaptor.setStyle(cell, 'borderLeft', '.07em ' + line);
                    }
                }
            }
            handleColumnWidths() {
                for (const row of this.childNodes) {
                    let i = 0;
                    for (const cell of this.adaptor.childNodes(row.dom[0])) {
                        const w = this.cWidths[i++];
                        if (w !== null) {
                            const width = typeof w === 'number' ? this.em(w) : w;
                            this.adaptor.setStyle(cell, 'width', width);
                            this.adaptor.setStyle(cell, 'maxWidth', width);
                            this.adaptor.setStyle(cell, 'minWidth', width);
                        }
                    }
                }
            }
            handleRowSpacing() {
                const scale = this.childNodes[0]
                    ? 1 / this.childNodes[0].getBBox().rscale
                    : 1;
                const spacing = this.getEmHalfSpacing([this.fSpace[1], this.fSpace[1]], this.rSpace, scale);
                const frame = this.fframe;
                let i = 0;
                for (const row of this.childNodes) {
                    const tspace = spacing[i++];
                    const bspace = spacing[i];
                    for (const cell of row.childNodes) {
                        if ((i > 1 && tspace !== '0.215em') || (frame && i === 1)) {
                            this.adaptor.setStyle(cell.dom[0], 'paddingTop', tspace);
                        }
                        if ((i < this.numRows && bspace !== '0.215em') ||
                            (frame && i === this.numRows)) {
                            this.adaptor.setStyle(cell.dom[0], 'paddingBottom', bspace);
                        }
                    }
                }
            }
            handleRowLines() {
                if (this.node.attributes.get('rowlines') === 'none')
                    return;
                const lines = this.getRowAttributes('rowlines');
                let i = 0;
                for (const row of this.childNodes.slice(1)) {
                    const line = lines[i++];
                    if (line === 'none')
                        continue;
                    for (const cell of this.adaptor.childNodes(row.dom[0])) {
                        this.adaptor.setStyle(cell, 'borderTop', '.07em ' + line);
                    }
                }
            }
            handleRowHeights() {
                if (this.node.attributes.get('equalrows')) {
                    this.handleEqualRows();
                }
            }
            handleEqualRows() {
                const space = this.getRowHalfSpacing();
                const { H, D, NH, ND } = this.getTableData();
                const HD = this.getEqualRowHeight();
                for (let i = 0; i < this.numRows; i++) {
                    const row = this.childNodes[i];
                    this.setRowHeight(row, HD + space[i] + space[i + 1] + this.rLines[i]);
                    if (HD !== NH[i] + ND[i]) {
                        this.setRowBaseline(row, HD, (HD - H[i] + D[i]) / 2);
                    }
                }
            }
            setRowHeight(row, HD) {
                this.adaptor.setStyle(row.dom[0], 'height', this.em(HD));
            }
            setRowBaseline(row, HD, D) {
                const ralign = row.node.attributes.get('rowalign');
                for (const cell of row.childNodes) {
                    if (this.setCellBaseline(cell, ralign, HD, D))
                        break;
                }
            }
            setCellBaseline(cell, ralign, HD, D) {
                const calign = cell.node.attributes.get('rowalign');
                if (calign === 'baseline' || calign === 'axis') {
                    const adaptor = this.adaptor;
                    const child = adaptor.lastChild(cell.dom[0]);
                    adaptor.setStyle(child, 'height', this.em(HD));
                    adaptor.setStyle(child, 'verticalAlign', this.em(-D));
                    const row = cell.parent;
                    if ((!row.node.isKind('mlabeledtr') || cell !== row.childNodes[0]) &&
                        (ralign === 'baseline' || ralign === 'axis')) {
                        return true;
                    }
                }
                return false;
            }
            handleFrame() {
                if (this.frame && this.fLine) {
                    const frame = this.node.attributes.get('frame');
                    this.adaptor.setStyle(this.itable, 'border', `${this.em(this.fLine)} ${frame}`);
                }
            }
            handleWidth() {
                const adaptor = this.adaptor;
                const dom = this.dom[0];
                const { w, L, R } = this.getBBox();
                adaptor.setStyle(dom, 'minWidth', this.em(L + w + R));
                let W = this.node.attributes.get('width');
                if (isPercent(W)) {
                    adaptor.setStyle(dom, 'width', '');
                    adaptor.setAttribute(dom, 'width', 'full');
                }
                else if (!this.hasLabels) {
                    if (W === 'auto')
                        return;
                    W = this.em(this.length2em(W) + 2 * this.fLine);
                }
                const table = adaptor.firstChild(dom);
                adaptor.setStyle(table, 'width', W);
                adaptor.setStyle(table, 'minWidth', this.em(w));
                if (L || R) {
                    adaptor.setStyle(dom, 'margin', '');
                    const style = this.node.attributes.get('data-width-includes-label')
                        ? 'padding'
                        : 'margin';
                    if (L === R) {
                        adaptor.setStyle(table, style, '0 ' + this.em(R));
                    }
                    else {
                        adaptor.setStyle(table, style, '0 ' + this.em(R) + ' 0 ' + this.em(L));
                    }
                }
                adaptor.setAttribute(this.itable, 'width', 'full');
            }
            handleAlign() {
                const [align, row] = this.getAlignmentRow();
                const dom = this.dom[0];
                if (row === null) {
                    if (align !== 'axis') {
                        this.adaptor.setAttribute(dom, 'align', align);
                    }
                }
                else {
                    const y = this.getVerticalPosition(row, align);
                    this.adaptor.setAttribute(dom, 'align', 'top');
                    this.adaptor.setStyle(dom, 'verticalAlign', this.em(y));
                }
            }
            handleJustify() {
                const align = this.getAlignShift()[0];
                if (align !== 'center') {
                    this.adaptor.setAttribute(this.dom[0], 'justify', align);
                }
            }
            handleLabels() {
                if (!this.hasLabels)
                    return;
                const labels = this.labels;
                const attributes = this.node.attributes;
                const adaptor = this.adaptor;
                const side = attributes.get('side');
                adaptor.setAttribute(this.dom[0], 'side', side);
                adaptor.setAttribute(labels, 'align', side);
                adaptor.setStyle(labels, side, '0');
                const [align, shift] = this.addLabelPadding(side);
                if (shift) {
                    const table = adaptor.firstChild(this.dom[0]);
                    this.setIndent(table, align, shift);
                }
                this.updateRowHeights();
                this.addLabelSpacing();
            }
            addLabelPadding(side) {
                const [, align, shift] = this.getPadAlignShift(side);
                const styles = {};
                if (side === 'right' &&
                    !this.node.attributes.get('data-width-includes-label')) {
                    const W = this.node.attributes.get('width');
                    const { w, L, R } = this.getBBox();
                    styles.style = {
                        width: isPercent(W)
                            ? 'calc(' + W + ' + ' + this.em(L + R) + ')'
                            : this.em(L + w + R),
                    };
                }
                this.adaptor.append(this.dom[0], this.html('mjx-labels', styles, [this.labels]));
                return [align, shift];
            }
            updateRowHeights() {
                const { H, D, NH, ND } = this.getTableData();
                const space = this.getRowHalfSpacing();
                for (let i = 0; i < this.numRows; i++) {
                    const row = this.childNodes[i];
                    this.setRowHeight(row, H[i] + D[i] + space[i] + space[i + 1] + this.rLines[i]);
                    if (H[i] !== NH[i] || D[i] !== ND[i]) {
                        this.setRowBaseline(row, H[i] + D[i], D[i]);
                    }
                    else if (row.node.isKind('mlabeledtr')) {
                        this.setCellBaseline(row.childNodes[0], '', H[i] + D[i], D[i]);
                    }
                }
            }
            addLabelSpacing() {
                const adaptor = this.adaptor;
                const equal = this.node.attributes.get('equalrows');
                const { H, D } = this.getTableData();
                const HD = equal ? this.getEqualRowHeight() : 0;
                const space = this.getRowHalfSpacing();
                let h = this.fLine;
                let current = adaptor.firstChild(this.labels);
                for (let i = 0; i < this.numRows; i++) {
                    const row = this.childNodes[i];
                    if (row.node.isKind('mlabeledtr')) {
                        if (h) {
                            adaptor.insert(this.html('mjx-mtr', { style: { height: this.em(h) } }), current);
                        }
                        adaptor.setStyle(current, 'height', this.em((equal ? HD : H[i] + D[i]) + space[i] + space[i + 1]));
                        current = adaptor.next(current);
                        h = this.rLines[i];
                    }
                    else {
                        h +=
                            space[i] +
                                (equal ? HD : H[i] + D[i]) +
                                space[i + 1] +
                                this.rLines[i];
                    }
                }
            }
        },
        _a.kind = MmlMtable.prototype.kind,
        _a.styles = {
            'mjx-mtable': {
                'vertical-align': '.25em',
                'text-align': 'center',
                position: 'relative',
                'box-sizing': 'border-box',
                'border-spacing': 0,
                'border-collapse': 'collapse',
            },
            'mjx-mstyle[size="s"] mjx-mtable': {
                'vertical-align': '.354em',
            },
            'mjx-labels': {
                position: 'absolute',
                left: 0,
                top: 0,
            },
            'mjx-table': {
                display: 'inline-block',
                'vertical-align': '-.5ex',
                'box-sizing': 'border-box',
            },
            'mjx-table > mjx-itable': {
                'vertical-align': 'middle',
                'text-align': 'left',
                'box-sizing': 'border-box',
            },
            'mjx-labels > mjx-itable': {
                position: 'absolute',
                top: 0,
            },
            'mjx-mtable[justify="left"]': {
                'text-align': 'left',
            },
            'mjx-mtable[justify="right"]': {
                'text-align': 'right',
            },
            'mjx-mtable[justify="left"][side="left"]': {
                'padding-right': '0 ! important',
            },
            'mjx-mtable[justify="left"][side="right"]': {
                'padding-left': '0 ! important',
            },
            'mjx-mtable[justify="right"][side="left"]': {
                'padding-right': '0 ! important',
            },
            'mjx-mtable[justify="right"][side="right"]': {
                'padding-left': '0 ! important',
            },
            'mjx-mtable[align]': {
                'vertical-align': 'baseline',
            },
            'mjx-mtable[align="top"] > mjx-table': {
                'vertical-align': 'top',
            },
            'mjx-mtable[align="bottom"] > mjx-table': {
                'vertical-align': 'bottom',
            },
            'mjx-mtable[side="right"] mjx-labels': {
                'min-width': '100%',
            },
        },
        _a;
})();
//# sourceMappingURL=mtable.js.map