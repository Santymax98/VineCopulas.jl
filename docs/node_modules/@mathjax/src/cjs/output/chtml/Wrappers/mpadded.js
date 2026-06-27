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
exports.ChtmlMpadded = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mpadded_js_1 = require("../../common/Wrappers/mpadded.js");
var mpadded_js_2 = require("../../../core/MmlTree/MmlNodes/mpadded.js");
exports.ChtmlMpadded = (function () {
    var _a;
    var Base = (0, mpadded_js_1.CommonMpaddedMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMpadded, _super);
            function ChtmlMpadded() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMpadded.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                var chtml = this.standardChtmlNodes(parents);
                var content = [];
                var style = {};
                var _b = __read(this.getDimens(), 9), W = _b[2], dh = _b[3], dd = _b[4], dw = _b[5], x = _b[6], y = _b[7], dx = _b[8];
                if (dw || this.childNodes[0].getBBox().pwidth) {
                    style.width = this.em(W + dw);
                }
                if (dh || dd) {
                    style.margin = this.em(dh) + ' 0 ' + this.em(dd);
                }
                if (x + dx || y) {
                    style.position = 'relative';
                    var rbox = this.html('mjx-rbox', {
                        style: {
                            left: this.em(x + dx),
                            top: this.em(-y),
                            'max-width': style.width,
                        },
                    });
                    if (x + dx && this.childNodes[0].getBBox().pwidth) {
                        this.adaptor.setAttribute(rbox, 'width', 'full');
                        this.adaptor.setStyle(rbox, 'left', this.em(x));
                    }
                    content.push(rbox);
                }
                chtml = [
                    this.adaptor.append(chtml[0], this.html('mjx-block', { style: style }, content)),
                ];
                if (this.childNodes[0].childNodes.length) {
                    this.childNodes[0].toCHTML([content[0] || chtml[0]]);
                }
                else if (dh || dd) {
                    this.adaptor.append(content[0] || chtml[0], this.html('mjx-box'));
                }
            };
            return ChtmlMpadded;
        }(Base)),
        _a.kind = mpadded_js_2.MmlMpadded.prototype.kind,
        _a.styles = {
            'mjx-mpadded': {
                display: 'inline-block',
            },
            'mjx-rbox': {
                display: 'inline-block',
                position: 'relative',
            },
        },
        _a;
})();
//# sourceMappingURL=mpadded.js.map