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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgXmlNode = exports.SvgAnnotationXML = exports.SvgAnnotation = exports.SvgSemantics = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var semantics_js_1 = require("../../common/Wrappers/semantics.js");
var XmlNode_js_1 = require("../../common/Wrappers/XmlNode.js");
var semantics_js_2 = require("../../../core/MmlTree/MmlNodes/semantics.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
exports.SvgSemantics = (function () {
    var _a;
    var Base = (0, semantics_js_1.CommonSemanticsMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgSemantics, _super);
            function SvgSemantics() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgSemantics.prototype.toSVG = function (parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                var svg = this.standardSvgNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toSVG(svg);
                }
            };
            return SvgSemantics;
        }(Base)),
        _a.kind = semantics_js_2.MmlSemantics.prototype.kind,
        _a;
})();
exports.SvgAnnotation = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(SvgAnnotation, _super);
            function SvgAnnotation() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgAnnotation.prototype.toSVG = function (parents) {
                _super.prototype.toSVG.call(this, parents);
            };
            SvgAnnotation.prototype.computeBBox = function () {
                return this.bbox;
            };
            return SvgAnnotation;
        }(Wrapper_js_1.SvgWrapper)),
        _a.kind = semantics_js_2.MmlAnnotation.prototype.kind,
        _a;
})();
exports.SvgAnnotationXML = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(SvgAnnotationXML, _super);
            function SvgAnnotationXML() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgAnnotationXML;
        }(Wrapper_js_1.SvgWrapper)),
        _a.kind = semantics_js_2.MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'foreignObject[data-mjx-xml]': {
                'font-family': 'initial',
                'line-height': 'normal',
                overflow: 'visible',
            },
        },
        _a;
})();
exports.SvgXmlNode = (function () {
    var _a;
    var Base = (0, XmlNode_js_1.CommonXmlNodeMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgXmlNode, _super);
            function SvgXmlNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgXmlNode.prototype.toSVG = function (parents) {
                var metrics = this.jax.math.metrics;
                var em = metrics.em * metrics.scale * this.rscale;
                var scale = this.fixed(1 / em, 3);
                var _b = this.getBBox(), w = _b.w, h = _b.h, d = _b.d;
                this.dom = [
                    this.adaptor.append(parents[0], this.svg('foreignObject', {
                        'data-mjx-xml': true,
                        y: this.jax.fixed(-h * em) + 'px',
                        width: this.jax.fixed(w * em) + 'px',
                        height: this.jax.fixed((h + d) * em) + 'px',
                        transform: "scale(".concat(scale, ") matrix(1 0 0 -1 0 0)"),
                    }, [this.getHTML()])),
                ];
            };
            SvgXmlNode.prototype.addHDW = function (html, styles) {
                html = this.html('mjx-html-holder', { style: styles }, [html]);
                var _b = this.getBBox(), h = _b.h, d = _b.d, w = _b.w;
                var scale = this.metrics.scale;
                styles.height = this.em((h + d) * scale);
                styles.width = this.em(w * scale);
                styles['vertical-align'] = this.em(-d * scale);
                delete styles['font-size'];
                delete styles['font-family'];
                return html;
            };
            return SvgXmlNode;
        }(Base)),
        _a.kind = MmlNode_js_1.XMLNode.prototype.kind,
        _a.styles = __assign({ 'foreignObject[data-mjx-html]': {
                overflow: 'visible',
            } }, Base.styles),
        _a;
})();
//# sourceMappingURL=semantics.js.map