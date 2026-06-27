"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChtmlMtable = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mtable_js_1 = require("../../common/Wrappers/mtable.js");
var mtable_js_2 = require("../../../core/MmlTree/MmlNodes/mtable.js");
var string_js_1 = require("../../../util/string.js");
exports.ChtmlMtable = (function () {
    var _a;
    var Base = (0, mtable_js_1.CommonMtableMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMtable, _super);
            function ChtmlMtable(factory, node, parent) {
                if (parent === void 0) { parent = null; }
                var _this = _super.call(this, factory, node, parent) || this;
                _this.itable = _this.html('mjx-itable');
                _this.labels = _this.html('mjx-itable');
                return _this;
            }
            ChtmlMtable.prototype.getAlignShift = function () {
                var data = _super.prototype.getAlignShift.call(this);
                if (!this.isTop) {
                    data[1] = 0;
                }
                return data;
            };
            ChtmlMtable.prototype.toCHTML = function (parents) {
                var e_1, _b;
                var chtml = this.standardChtmlNodes(parents);
                this.adaptor.append(chtml[0], this.html('mjx-table', {}, [this.itable]));
                try {
                    for (var _c = __values(this.childNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var child = _d.value;
                        child.toCHTML([this.itable]);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
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
            };
            ChtmlMtable.prototype.shiftColor = function () {
                var adaptor = this.adaptor;
                var color = adaptor.getStyle(this.dom[0], 'backgroundColor');
                if (color) {
                    adaptor.setStyle(this.dom[0], 'backgroundColor', '');
                    adaptor.setStyle(this.itable, 'backgroundColor', color);
                }
            };
            ChtmlMtable.prototype.padRows = function () {
                var e_2, _b;
                var adaptor = this.adaptor;
                try {
                    for (var _c = __values(adaptor.childNodes(this.itable)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var row = _d.value;
                        while (adaptor.childNodes(row).length < this.numCols) {
                            adaptor.append(row, this.html('mjx-mtd', { extra: true }));
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
            ChtmlMtable.prototype.handleColumnSpacing = function () {
                var e_3, _b, e_4, _c;
                var scale = this.childNodes[0]
                    ? 1 / this.childNodes[0].getBBox().rscale
                    : 1;
                var spacing = this.getEmHalfSpacing([this.fSpace[0], this.fSpace[2]], this.cSpace, scale);
                try {
                    for (var _d = __values(this.tableRows), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var row = _e.value;
                        var i = 0;
                        try {
                            for (var _f = (e_4 = void 0, __values(row.tableCells)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var cell = _g.value;
                                var lspace = spacing[i++];
                                var rspace = spacing[i];
                                var styleNode = cell
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
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            };
            ChtmlMtable.prototype.handleColumnLines = function () {
                var e_5, _b, e_6, _c;
                if (this.node.attributes.get('columnlines') === 'none')
                    return;
                var lines = this.getColumnAttributes('columnlines');
                try {
                    for (var _d = __values(this.childNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var row = _e.value;
                        var i = 0;
                        var cells = this.adaptor.childNodes(row.dom[0]).slice(1);
                        try {
                            for (var cells_1 = (e_6 = void 0, __values(cells)), cells_1_1 = cells_1.next(); !cells_1_1.done; cells_1_1 = cells_1.next()) {
                                var cell = cells_1_1.value;
                                var line = lines[i++];
                                if (line === 'none')
                                    continue;
                                this.adaptor.setStyle(cell, 'borderLeft', '.07em ' + line);
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (cells_1_1 && !cells_1_1.done && (_c = cells_1.return)) _c.call(cells_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            };
            ChtmlMtable.prototype.handleColumnWidths = function () {
                var e_7, _b, e_8, _c;
                try {
                    for (var _d = __values(this.childNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var row = _e.value;
                        var i = 0;
                        try {
                            for (var _f = (e_8 = void 0, __values(this.adaptor.childNodes(row.dom[0]))), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var cell = _g.value;
                                var w = this.cWidths[i++];
                                if (w !== null) {
                                    var width = typeof w === 'number' ? this.em(w) : w;
                                    this.adaptor.setStyle(cell, 'width', width);
                                    this.adaptor.setStyle(cell, 'maxWidth', width);
                                    this.adaptor.setStyle(cell, 'minWidth', width);
                                }
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            };
            ChtmlMtable.prototype.handleRowSpacing = function () {
                var e_9, _b, e_10, _c;
                var scale = this.childNodes[0]
                    ? 1 / this.childNodes[0].getBBox().rscale
                    : 1;
                var spacing = this.getEmHalfSpacing([this.fSpace[1], this.fSpace[1]], this.rSpace, scale);
                var frame = this.fframe;
                var i = 0;
                try {
                    for (var _d = __values(this.childNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var row = _e.value;
                        var tspace = spacing[i++];
                        var bspace = spacing[i];
                        try {
                            for (var _f = (e_10 = void 0, __values(row.childNodes)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var cell = _g.value;
                                if ((i > 1 && tspace !== '0.215em') || (frame && i === 1)) {
                                    this.adaptor.setStyle(cell.dom[0], 'paddingTop', tspace);
                                }
                                if ((i < this.numRows && bspace !== '0.215em') ||
                                    (frame && i === this.numRows)) {
                                    this.adaptor.setStyle(cell.dom[0], 'paddingBottom', bspace);
                                }
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
            };
            ChtmlMtable.prototype.handleRowLines = function () {
                var e_11, _b, e_12, _c;
                if (this.node.attributes.get('rowlines') === 'none')
                    return;
                var lines = this.getRowAttributes('rowlines');
                var i = 0;
                try {
                    for (var _d = __values(this.childNodes.slice(1)), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var row = _e.value;
                        var line = lines[i++];
                        if (line === 'none')
                            continue;
                        try {
                            for (var _f = (e_12 = void 0, __values(this.adaptor.childNodes(row.dom[0]))), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var cell = _g.value;
                                this.adaptor.setStyle(cell, 'borderTop', '.07em ' + line);
                            }
                        }
                        catch (e_12_1) { e_12 = { error: e_12_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                            }
                            finally { if (e_12) throw e_12.error; }
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            };
            ChtmlMtable.prototype.handleRowHeights = function () {
                if (this.node.attributes.get('equalrows')) {
                    this.handleEqualRows();
                }
            };
            ChtmlMtable.prototype.handleEqualRows = function () {
                var space = this.getRowHalfSpacing();
                var _b = this.getTableData(), H = _b.H, D = _b.D, NH = _b.NH, ND = _b.ND;
                var HD = this.getEqualRowHeight();
                for (var i = 0; i < this.numRows; i++) {
                    var row = this.childNodes[i];
                    this.setRowHeight(row, HD + space[i] + space[i + 1] + this.rLines[i]);
                    if (HD !== NH[i] + ND[i]) {
                        this.setRowBaseline(row, HD, (HD - H[i] + D[i]) / 2);
                    }
                }
            };
            ChtmlMtable.prototype.setRowHeight = function (row, HD) {
                this.adaptor.setStyle(row.dom[0], 'height', this.em(HD));
            };
            ChtmlMtable.prototype.setRowBaseline = function (row, HD, D) {
                var e_13, _b;
                var ralign = row.node.attributes.get('rowalign');
                try {
                    for (var _c = __values(row.childNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var cell = _d.value;
                        if (this.setCellBaseline(cell, ralign, HD, D))
                            break;
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
            };
            ChtmlMtable.prototype.setCellBaseline = function (cell, ralign, HD, D) {
                var calign = cell.node.attributes.get('rowalign');
                if (calign === 'baseline' || calign === 'axis') {
                    var adaptor = this.adaptor;
                    var child = adaptor.lastChild(cell.dom[0]);
                    adaptor.setStyle(child, 'height', this.em(HD));
                    adaptor.setStyle(child, 'verticalAlign', this.em(-D));
                    var row = cell.parent;
                    if ((!row.node.isKind('mlabeledtr') || cell !== row.childNodes[0]) &&
                        (ralign === 'baseline' || ralign === 'axis')) {
                        return true;
                    }
                }
                return false;
            };
            ChtmlMtable.prototype.handleFrame = function () {
                if (this.frame && this.fLine) {
                    var frame = this.node.attributes.get('frame');
                    this.adaptor.setStyle(this.itable, 'border', "".concat(this.em(this.fLine), " ").concat(frame));
                }
            };
            ChtmlMtable.prototype.handleWidth = function () {
                var adaptor = this.adaptor;
                var dom = this.dom[0];
                var _b = this.getBBox(), w = _b.w, L = _b.L, R = _b.R;
                adaptor.setStyle(dom, 'minWidth', this.em(L + w + R));
                var W = this.node.attributes.get('width');
                if ((0, string_js_1.isPercent)(W)) {
                    adaptor.setStyle(dom, 'width', '');
                    adaptor.setAttribute(dom, 'width', 'full');
                }
                else if (!this.hasLabels) {
                    if (W === 'auto')
                        return;
                    W = this.em(this.length2em(W) + 2 * this.fLine);
                }
                var table = adaptor.firstChild(dom);
                adaptor.setStyle(table, 'width', W);
                adaptor.setStyle(table, 'minWidth', this.em(w));
                if (L || R) {
                    adaptor.setStyle(dom, 'margin', '');
                    var style = this.node.attributes.get('data-width-includes-label')
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
            };
            ChtmlMtable.prototype.handleAlign = function () {
                var _b = __read(this.getAlignmentRow(), 2), align = _b[0], row = _b[1];
                var dom = this.dom[0];
                if (row === null) {
                    if (align !== 'axis') {
                        this.adaptor.setAttribute(dom, 'align', align);
                    }
                }
                else {
                    var y = this.getVerticalPosition(row, align);
                    this.adaptor.setAttribute(dom, 'align', 'top');
                    this.adaptor.setStyle(dom, 'verticalAlign', this.em(y));
                }
            };
            ChtmlMtable.prototype.handleJustify = function () {
                var align = this.getAlignShift()[0];
                if (align !== 'center') {
                    this.adaptor.setAttribute(this.dom[0], 'justify', align);
                }
            };
            ChtmlMtable.prototype.handleLabels = function () {
                if (!this.hasLabels)
                    return;
                var labels = this.labels;
                var attributes = this.node.attributes;
                var adaptor = this.adaptor;
                var side = attributes.get('side');
                adaptor.setAttribute(this.dom[0], 'side', side);
                adaptor.setAttribute(labels, 'align', side);
                adaptor.setStyle(labels, side, '0');
                var _b = __read(this.addLabelPadding(side), 2), align = _b[0], shift = _b[1];
                if (shift) {
                    var table = adaptor.firstChild(this.dom[0]);
                    this.setIndent(table, align, shift);
                }
                this.updateRowHeights();
                this.addLabelSpacing();
            };
            ChtmlMtable.prototype.addLabelPadding = function (side) {
                var _b = __read(this.getPadAlignShift(side), 3), align = _b[1], shift = _b[2];
                var styles = {};
                if (side === 'right' &&
                    !this.node.attributes.get('data-width-includes-label')) {
                    var W = this.node.attributes.get('width');
                    var _c = this.getBBox(), w = _c.w, L = _c.L, R = _c.R;
                    styles.style = {
                        width: (0, string_js_1.isPercent)(W)
                            ? 'calc(' + W + ' + ' + this.em(L + R) + ')'
                            : this.em(L + w + R),
                    };
                }
                this.adaptor.append(this.dom[0], this.html('mjx-labels', styles, [this.labels]));
                return [align, shift];
            };
            ChtmlMtable.prototype.updateRowHeights = function () {
                var _b = this.getTableData(), H = _b.H, D = _b.D, NH = _b.NH, ND = _b.ND;
                var space = this.getRowHalfSpacing();
                for (var i = 0; i < this.numRows; i++) {
                    var row = this.childNodes[i];
                    this.setRowHeight(row, H[i] + D[i] + space[i] + space[i + 1] + this.rLines[i]);
                    if (H[i] !== NH[i] || D[i] !== ND[i]) {
                        this.setRowBaseline(row, H[i] + D[i], D[i]);
                    }
                    else if (row.node.isKind('mlabeledtr')) {
                        this.setCellBaseline(row.childNodes[0], '', H[i] + D[i], D[i]);
                    }
                }
            };
            ChtmlMtable.prototype.addLabelSpacing = function () {
                var adaptor = this.adaptor;
                var equal = this.node.attributes.get('equalrows');
                var _b = this.getTableData(), H = _b.H, D = _b.D;
                var HD = equal ? this.getEqualRowHeight() : 0;
                var space = this.getRowHalfSpacing();
                var h = this.fLine;
                var current = adaptor.firstChild(this.labels);
                for (var i = 0; i < this.numRows; i++) {
                    var row = this.childNodes[i];
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
            };
            return ChtmlMtable;
        }(Base)),
        _a.kind = mtable_js_2.MmlMtable.prototype.kind,
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