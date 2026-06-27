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
exports.ChtmlMsqrt = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var msqrt_js_1 = require("../../common/Wrappers/msqrt.js");
var msqrt_js_2 = require("../../../core/MmlTree/MmlNodes/msqrt.js");
exports.ChtmlMsqrt = (function () {
    var _a;
    var Base = (0, msqrt_js_1.CommonMsqrtMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMsqrt, _super);
            function ChtmlMsqrt() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMsqrt.prototype.toCHTML = function (parents) {
                var surd = this.surd;
                var base = this.childNodes[this.base];
                var sbox = surd.getBBox();
                var bbox = base.getOuterBBox();
                var _b = __read(this.getPQ(sbox), 2), q = _b[1];
                var t = this.font.params.surd_height;
                var H = bbox.h + q + t;
                var adaptor = this.adaptor;
                var CHTML = this.standardChtmlNodes(parents);
                var SURD, BASE, ROOT, root;
                if (this.root != null) {
                    ROOT = adaptor.append(CHTML[0], this.html('mjx-root'));
                    root = this.childNodes[this.root];
                }
                var SQRT = adaptor.append(CHTML[0], this.html('mjx-sqrt', {}, [
                    (SURD = this.html('mjx-surd')),
                    (BASE = this.html('mjx-box', { style: { paddingTop: this.em(q) } })),
                ]));
                if (t !== 0.06) {
                    adaptor.setStyle(BASE, 'border-top-width', this.em(t * this.font.params.rule_factor));
                }
                this.addRoot(ROOT, root, sbox, H);
                surd.toCHTML([SURD]);
                base.toCHTML([BASE]);
                if (surd.size < 0) {
                    adaptor.addClass(SQRT, 'mjx-tall');
                }
            };
            ChtmlMsqrt.prototype.addRoot = function (_ROOT, _root, _sbox, _H) { };
            return ChtmlMsqrt;
        }(Base)),
        _a.kind = msqrt_js_2.MmlMsqrt.prototype.kind,
        _a.styles = {
            'mjx-root': {
                display: 'inline-block',
                'white-space': 'nowrap',
            },
            'mjx-surd': {
                display: 'inline-block',
                'vertical-align': 'top',
            },
            'mjx-sqrt': {
                display: 'inline-block',
                'padding-top': '.075em',
            },
            'mjx-sqrt > mjx-box': {
                'border-top': '.075em solid',
                'padding-left': '.03em',
                'margin-left': '-.03em',
            },
            'mjx-sqrt.mjx-tall > mjx-box': {
                'padding-left': '.3em',
                'margin-left': '-.3em',
            },
        },
        _a;
})();
//# sourceMappingURL=msqrt.js.map