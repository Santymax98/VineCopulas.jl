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
exports.ChtmlTeXAtom = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var TeXAtom_js_1 = require("../../common/Wrappers/TeXAtom.js");
var TeXAtom_js_2 = require("../../../core/MmlTree/MmlNodes/TeXAtom.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
exports.ChtmlTeXAtom = (function () {
    var _a;
    var Base = (0, TeXAtom_js_1.CommonTeXAtomMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlTeXAtom, _super);
            function ChtmlTeXAtom() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlTeXAtom.prototype.toCHTML = function (parents) {
                var _this = this;
                _super.prototype.toCHTML.call(this, parents);
                this.dom.forEach(function (dom) {
                    return _this.adaptor.setAttribute(dom, 'texclass', MmlNode_js_1.TEXCLASSNAMES[_this.node.texClass]);
                });
            };
            return ChtmlTeXAtom;
        }(Base)),
        _a.kind = TeXAtom_js_2.TeXAtom.prototype.kind,
        _a;
})();
//# sourceMappingURL=TeXAtom.js.map