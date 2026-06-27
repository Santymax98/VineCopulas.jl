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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChtmlXmlNode = exports.ChtmlAnnotationXML = exports.ChtmlAnnotation = exports.ChtmlSemantics = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var semantics_js_1 = require("../../common/Wrappers/semantics.js");
var XmlNode_js_1 = require("../../common/Wrappers/XmlNode.js");
var semantics_js_2 = require("../../../core/MmlTree/MmlNodes/semantics.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
exports.ChtmlSemantics = (function () {
    var _a;
    var Base = (0, semantics_js_1.CommonSemanticsMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlSemantics, _super);
            function ChtmlSemantics() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlSemantics.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                var chtml = this.standardChtmlNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toCHTML(chtml);
                }
            };
            return ChtmlSemantics;
        }(Base)),
        _a.kind = semantics_js_2.MmlSemantics.prototype.kind,
        _a;
})();
exports.ChtmlAnnotation = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(ChtmlAnnotation, _super);
            function ChtmlAnnotation() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlAnnotation.prototype.toCHTML = function (parents) {
                _super.prototype.toCHTML.call(this, parents);
            };
            ChtmlAnnotation.prototype.computeBBox = function () {
                return this.bbox;
            };
            return ChtmlAnnotation;
        }(Wrapper_js_1.ChtmlWrapper)),
        _a.kind = semantics_js_2.MmlAnnotation.prototype.kind,
        _a;
})();
exports.ChtmlAnnotationXML = (function () {
    var _a;
    return _a = (function (_super) {
            __extends(ChtmlAnnotationXML, _super);
            function ChtmlAnnotationXML() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ChtmlAnnotationXML;
        }(Wrapper_js_1.ChtmlWrapper)),
        _a.kind = semantics_js_2.MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'mjx-annotation-xml': {
                'font-family': 'initial',
                'line-height': 'normal',
            },
        },
        _a;
})();
exports.ChtmlXmlNode = (function () {
    var _a;
    var Base = (0, XmlNode_js_1.CommonXmlNodeMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlXmlNode, _super);
            function ChtmlXmlNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlXmlNode.prototype.toCHTML = function (parents) {
                this.markUsed();
                this.dom = [this.adaptor.append(parents[0], this.getHTML())];
            };
            ChtmlXmlNode.prototype.addHDW = function (html, styles) {
                var scale = this.jax.options.scale;
                var _b = this.bbox, h = _b.h, d = _b.d, w = _b.w;
                var rscale = scale * this.metrics.scale;
                styles.width = this.em(w * rscale);
                styles.height = this.em((h + d) * rscale);
                styles['vertical-align'] = this.em(-d * rscale);
                styles.position = 'relative';
                return this.html('mjx-html-holder', {
                    style: {
                        transform: "scale(".concat(this.jax.fixed(scale), ")"),
                        'transform-origin': 'top left',
                    },
                }, [html]);
            };
            return ChtmlXmlNode;
        }(Base)),
        _a.kind = MmlNode_js_1.XMLNode.prototype.kind,
        _a;
})();
//# sourceMappingURL=semantics.js.map