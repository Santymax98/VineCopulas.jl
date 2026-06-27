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
exports.CommonXmlNodeMixin = CommonXmlNodeMixin;
var string_js_1 = require("../../../util/string.js");
function CommonXmlNodeMixin(Base) {
    var CommonXmlNodeMixin = (function (_super) {
        __extends(CommonXmlNodeMixin, _super);
        function CommonXmlNodeMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            _this.rscale = _this.getRScale();
            return _this;
        }
        CommonXmlNodeMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            var xml = this.node.getXML();
            var hdw = this.getHDW(xml, 'use', 'force');
            var _a = hdw ? this.splitHDW(hdw) : this.measureXmlNode(xml), h = _a.h, d = _a.d, w = _a.w;
            bbox.w = w;
            bbox.h = h;
            bbox.d = d;
        };
        CommonXmlNodeMixin.prototype.getHTML = function () {
            var adaptor = this.adaptor;
            var html = adaptor.clone(this.node.getXML());
            var styles = this.getFontStyles();
            var hdw = this.getHDW(html, 'force');
            if (hdw || this.jax.options.scale !== 1) {
                html = this.addHDW(html, styles);
            }
            return this.html('mjx-html', { variant: this.parent.variant, style: styles }, [html]);
        };
        CommonXmlNodeMixin.prototype.getHDW = function (xml, use, force) {
            if (force === void 0) { force = use; }
            var option = this.jax.options.htmlHDW;
            var hdw = this.adaptor.getAttribute(xml, 'data-mjx-hdw');
            return hdw && (option === use || option === force) ? hdw : null;
        };
        CommonXmlNodeMixin.prototype.splitHDW = function (hdw) {
            var _this = this;
            var scale = 1 / this.metrics.scale;
            var _a = __read((0, string_js_1.split)(hdw).map(function (x) { return _this.length2em(x || '0') * scale; }), 3), h = _a[0], d = _a[1], w = _a[2];
            return { h: h, d: d, w: w };
        };
        CommonXmlNodeMixin.prototype.getFontStyles = function () {
            var _a;
            var adaptor = this.adaptor;
            var metrics = this.metrics;
            return {
                'font-family': ((_a = this.parent.styles) === null || _a === void 0 ? void 0 : _a.get('font-family')) ||
                    metrics.family ||
                    adaptor.fontFamily(adaptor.parent(this.jax.math.start.node)) ||
                    'initial',
                'font-size': this.jax.fixed(metrics.em * this.rscale) + 'px',
            };
        };
        CommonXmlNodeMixin.prototype.measureXmlNode = function (xml) {
            var adaptor = this.adaptor;
            var content = this.html('mjx-xml-block', { style: { display: 'inline-block' } }, [adaptor.clone(xml)]);
            var base = this.html('mjx-baseline', {
                style: { display: 'inline-block', width: 0, height: 0 },
            });
            var style = this.getFontStyles();
            var node = this.html('mjx-measure-xml', { style: style }, [base, content]);
            var container = this.jax.container;
            adaptor.append(adaptor.parent(this.jax.math.start.node), container);
            adaptor.append(container, node);
            var metrics = this.metrics;
            var em = metrics.em * metrics.scale * this.rscale;
            var _a = adaptor.nodeBBox(content), left = _a.left, right = _a.right, bottom = _a.bottom, top = _a.top;
            var w = (right - left) / em;
            var h = (adaptor.nodeBBox(base).top - top) / em;
            var d = (bottom - top) / em - h;
            adaptor.remove(container);
            adaptor.remove(node);
            return { w: w, h: h, d: d };
        };
        CommonXmlNodeMixin.prototype.getStyles = function () { };
        CommonXmlNodeMixin.prototype.getScale = function () { };
        CommonXmlNodeMixin.prototype.getVariant = function () { };
        CommonXmlNodeMixin.autoStyle = false;
        CommonXmlNodeMixin.styles = {
            'mjx-measure-xml': {
                position: 'absolute',
                left: 0,
                top: 0,
                display: 'inline-block',
                'line-height': 'normal',
                'white-space': 'normal',
            },
            'mjx-html': {
                display: 'inline-block',
                'line-height': 'normal',
                'text-align': 'initial',
                'white-space': 'initial',
            },
            'mjx-html-holder': {
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            },
        };
        return CommonXmlNodeMixin;
    }(Base));
    return CommonXmlNodeMixin;
}
//# sourceMappingURL=XmlNode.js.map