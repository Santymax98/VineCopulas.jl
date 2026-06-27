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
exports.CommonMtdMixin = CommonMtdMixin;
function CommonMtdMixin(Base) {
    return (function (_super) {
        __extends(CommonMtdMixin, _super);
        function CommonMtdMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CommonMtdMixin.prototype, "fixesPWidth", {
            get: function () {
                return false;
            },
            enumerable: false,
            configurable: true
        });
        CommonMtdMixin.prototype.invalidateBBox = function () {
            this.bboxComputed = false;
            this.lineBBox = [];
        };
        CommonMtdMixin.prototype.getWrapWidth = function (_j) {
            var table = this.parent.parent;
            var row = this.parent;
            var i = this.node.childPosition() - (row.labeled ? 1 : 0);
            return (typeof table.cWidths[i] === 'number'
                ? table.cWidths[i]
                : table.getTableData().W[i]);
        };
        CommonMtdMixin.prototype.getChildAlign = function (_i) {
            return this.node.attributes.get('columnalign');
        };
        return CommonMtdMixin;
    }(Base));
}
//# sourceMappingURL=mtd.js.map