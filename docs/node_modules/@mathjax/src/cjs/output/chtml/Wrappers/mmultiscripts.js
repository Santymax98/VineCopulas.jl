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
exports.ChtmlMmultiscripts = void 0;
var mmultiscripts_js_1 = require("../../common/Wrappers/mmultiscripts.js");
var msubsup_js_1 = require("./msubsup.js");
var mmultiscripts_js_2 = require("../../../core/MmlTree/MmlNodes/mmultiscripts.js");
var string_js_1 = require("../../../util/string.js");
exports.ChtmlMmultiscripts = (function () {
    var _a;
    var Base = (0, mmultiscripts_js_1.CommonMmultiscriptsMixin)(msubsup_js_1.ChtmlMsubsup);
    return _a = (function (_super) {
            __extends(ChtmlMmultiscripts, _super);
            function ChtmlMmultiscripts() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMmultiscripts.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                var chtml = this.standardChtmlNodes(parents);
                var data = this.scriptData;
                var scriptalign = this.node.getProperty('scriptalign') || 'right left';
                var _b = __read((0, string_js_1.split)(scriptalign + ' ' + scriptalign), 2), preAlign = _b[0], postAlign = _b[1];
                var _c = __read(this.getCombinedUV(), 2), u = _c[0], v = _c[1];
                if (data.numPrescripts) {
                    var scripts = this.addScripts(this.dom[0], u, -v, true, data.psub, data.psup, this.firstPrescript, data.numPrescripts);
                    if (preAlign !== 'right') {
                        this.adaptor.setAttribute(scripts, 'script-align', preAlign);
                    }
                }
                this.childNodes[0].toCHTML(chtml);
                if (data.numScripts) {
                    var scripts = this.addScripts(this.dom[this.dom.length - 1], u, -v, false, data.sub, data.sup, 1, data.numScripts);
                    if (postAlign !== 'left') {
                        this.adaptor.setAttribute(scripts, 'script-align', postAlign);
                    }
                }
            };
            ChtmlMmultiscripts.prototype.addScripts = function (dom, u, v, isPre, sub, sup, i, n) {
                var adaptor = this.adaptor;
                var q = u - sup.d + (v - sub.h);
                var U = u < 0 && v === 0 ? sub.h + u : u;
                var rowdef = q > 0 ? { style: { height: this.em(q) } } : {};
                var tabledef = U ? { style: { 'vertical-align': this.em(U) } } : {};
                var supRow = this.html('mjx-row');
                var sepRow = this.html('mjx-row', rowdef);
                var subRow = this.html('mjx-row');
                var name = 'mjx-' + (isPre ? 'pre' : '') + 'scripts';
                var m = i + 2 * n;
                while (i < m) {
                    this.childNodes[i++].toCHTML([
                        adaptor.append(subRow, this.html('mjx-cell')),
                    ]);
                    this.childNodes[i++].toCHTML([
                        adaptor.append(supRow, this.html('mjx-cell')),
                    ]);
                }
                return adaptor.append(dom, this.html(name, tabledef, [supRow, sepRow, subRow]));
            };
            return ChtmlMmultiscripts;
        }(Base)),
        _a.kind = mmultiscripts_js_2.MmlMmultiscripts.prototype.kind,
        _a.styles = {
            'mjx-prescripts': {
                display: 'inline-table',
                'padding-left': '.05em',
            },
            'mjx-scripts': {
                display: 'inline-table',
                'padding-right': '.05em',
            },
            'mjx-prescripts > mjx-row > mjx-cell': {
                'text-align': 'right',
            },
            '[script-align="left"] > mjx-row > mjx-cell': {
                'text-align': 'left',
            },
            '[script-align="center"] > mjx-row > mjx-cell': {
                'text-align': 'center',
            },
            '[script-align="right"] > mjx-row > mjx-cell': {
                'text-align': 'right',
            },
            'mjx-none': {
                display: 'inline-block',
                height: '1px',
            },
        },
        _a;
})();
//# sourceMappingURL=mmultiscripts.js.map