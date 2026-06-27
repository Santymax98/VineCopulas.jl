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
exports.CommonMspaceMixin = CommonMspaceMixin;
var BBox_js_1 = require("../../../util/BBox.js");
var LineBBox_js_1 = require("../LineBBox.js");
function CommonMspaceMixin(Base) {
    return (function (_super) {
        __extends(CommonMspaceMixin, _super);
        function CommonMspaceMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            _this.setBreakStyle();
            return _this;
        }
        Object.defineProperty(CommonMspaceMixin.prototype, "canBreak", {
            get: function () {
                return this.node.canBreak;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMspaceMixin.prototype, "breakCount", {
            get: function () {
                return this.breakStyle ? 1 : 0;
            },
            enumerable: false,
            configurable: true
        });
        CommonMspaceMixin.prototype.setBreakStyle = function (linebreak) {
            if (linebreak === void 0) { linebreak = ''; }
            this.breakStyle =
                linebreak ||
                    (this.node.hasNewline ||
                        this.node.getProperty('forcebreak')
                        ? 'before'
                        : '');
        };
        CommonMspaceMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            var attributes = this.node.attributes;
            bbox.w = this.length2em(attributes.get('width'), 0);
            bbox.h = this.length2em(attributes.get('height'), 0);
            bbox.d = this.length2em(attributes.get('depth'), 0);
        };
        CommonMspaceMixin.prototype.computeLineBBox = function (i) {
            var leadingString = this.node.attributes.get('data-lineleading');
            var leading = this.length2em(leadingString, this.linebreakOptions.lineleading);
            var bbox = LineBBox_js_1.LineBBox.from(BBox_js_1.BBox.zero(), leading);
            if (i === 1) {
                bbox.getIndentData(this.node);
                bbox.w = this.getBBox().w;
                bbox.isFirst = bbox.w === 0;
            }
            return bbox;
        };
        return CommonMspaceMixin;
    }(Base));
}
//# sourceMappingURL=mspace.js.map