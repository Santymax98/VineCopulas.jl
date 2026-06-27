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
exports.MmlVisitor = exports.DATAMJX = void 0;
var MmlNode_js_1 = require("./MmlNode.js");
var mi_js_1 = require("./MmlNodes/mi.js");
var MmlFactory_js_1 = require("./MmlFactory.js");
var Visitor_js_1 = require("../Tree/Visitor.js");
var Options_js_1 = require("../../util/Options.js");
exports.DATAMJX = 'data-mjx-';
var MmlVisitor = (function (_super) {
    __extends(MmlVisitor, _super);
    function MmlVisitor(factory) {
        if (factory === void 0) { factory = null; }
        if (!factory) {
            factory = new MmlFactory_js_1.MmlFactory();
        }
        return _super.call(this, factory) || this;
    }
    MmlVisitor.prototype.visitTextNode = function (_node) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
    };
    MmlVisitor.prototype.visitXMLNode = function (_node) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
    };
    MmlVisitor.prototype.visitHtmlNode = function (_node) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
    };
    MmlVisitor.prototype.getKind = function (node) {
        var kind = node.kind;
        return (0, Options_js_1.lookup)(kind, this.constructor.rename, kind);
    };
    MmlVisitor.prototype.getAttributeList = function (node) {
        var CLASS = this.constructor;
        var defaults = (0, Options_js_1.lookup)(node.kind, CLASS.defaultAttributes, {});
        var attributes = Object.assign({}, defaults, this.getDataAttributes(node), node.attributes.getAllAttributes());
        var variants = CLASS.variants;
        if (Object.hasOwn(attributes, 'mathvariant')) {
            if (Object.hasOwn(variants, attributes.mathvariant)) {
                attributes.mathvariant = variants[attributes.mathvariant];
            }
            else if (node.getProperty('ignore-variant')) {
                delete attributes.mathvariant;
            }
        }
        return attributes;
    };
    MmlVisitor.prototype.getDataAttributes = function (node) {
        var data = {};
        var variant = node.attributes.getExplicit('mathvariant');
        var variants = this.constructor.variants;
        if (variant &&
            (node.getProperty('ignore-variant') || Object.hasOwn(variants, variant))) {
            this.setDataAttribute(data, 'variant', variant);
        }
        if (node.getProperty('variantForm')) {
            this.setDataAttribute(data, 'alternate', '1');
        }
        if (node.getProperty('pseudoscript')) {
            this.setDataAttribute(data, 'pseudoscript', 'true');
        }
        if (node.getProperty('autoOP') === false) {
            this.setDataAttribute(data, 'auto-op', 'false');
        }
        var vbox = node.getProperty('vbox');
        if (vbox) {
            this.setDataAttribute(data, 'vbox', vbox);
        }
        var scriptalign = node.getProperty('scriptalign');
        if (scriptalign) {
            this.setDataAttribute(data, 'script-align', scriptalign);
        }
        var accent = node.getProperty('mathaccent');
        if (accent !== undefined) {
            if ((accent && !node.isMathAccent()) ||
                (!accent && !node.isMathAccentWithWidth())) {
                this.setDataAttribute(data, 'mathaccent', accent.toString());
            }
        }
        var texclass = node.getProperty('texClass');
        if (texclass !== undefined) {
            var setclass = true;
            if (texclass === MmlNode_js_1.TEXCLASS.OP && node.isKind('mi')) {
                var name_1 = node.getText();
                setclass = !(name_1.length > 1 && name_1.match(mi_js_1.MmlMi.operatorName));
            }
            if (setclass) {
                this.setDataAttribute(data, 'texclass', texclass < 0 ? 'NONE' : MmlNode_js_1.TEXCLASSNAMES[texclass]);
            }
        }
        if (node.getProperty('smallmatrix')) {
            this.setDataAttribute(data, 'smallmatrix', 'true');
        }
        return data;
    };
    MmlVisitor.prototype.setDataAttribute = function (data, name, value) {
        data[exports.DATAMJX + name] = value;
    };
    MmlVisitor.rename = {
        TeXAtom: 'mrow',
    };
    MmlVisitor.variants = {
        '-tex-calligraphic': 'script',
        '-tex-bold-calligraphic': 'bold-script',
        '-tex-oldstyle': 'normal',
        '-tex-bold-oldstyle': 'bold',
        '-tex-mathit': 'italic',
    };
    MmlVisitor.defaultAttributes = {
        math: {
            xmlns: 'http://www.w3.org/1998/Math/MathML',
        },
    };
    return MmlVisitor;
}(Visitor_js_1.AbstractVisitor));
exports.MmlVisitor = MmlVisitor;
//# sourceMappingURL=MmlVisitor.js.map