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
exports.CommonMsMixin = CommonMsMixin;
function CommonMsMixin(Base) {
    return (function (_super) {
        __extends(CommonMsMixin, _super);
        function CommonMsMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            var attributes = _this.node.attributes;
            var quotes = attributes.getList('lquote', 'rquote');
            if (_this.variant !== 'monospace') {
                if (!attributes.isSet('lquote') && quotes.lquote === '"') {
                    quotes.lquote = '\u201C';
                }
                if (!attributes.isSet('rquote') && quotes.rquote === '"') {
                    quotes.rquote = '\u201D';
                }
            }
            _this.childNodes.unshift(_this.createText(quotes.lquote));
            _this.childNodes.push(_this.createText(quotes.rquote));
            return _this;
        }
        CommonMsMixin.prototype.createText = function (text) {
            var node = this.wrap(this.mmlText(text));
            node.parent = this;
            return node;
        };
        return CommonMsMixin;
    }(Base));
}
//# sourceMappingURL=ms.js.map