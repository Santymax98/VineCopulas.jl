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
exports.TooltipData = void 0;
exports.CommonMactionMixin = CommonMactionMixin;
var string_js_1 = require("../../../util/string.js");
exports.TooltipData = {
    dx: '.2em',
    dy: '.1em',
    postDelay: 600,
    clearDelay: 100,
    hoverTimer: new Map(),
    clearTimer: new Map(),
    stopTimers: function (node, data) {
        if (data.clearTimer.has(node)) {
            clearTimeout(data.clearTimer.get(node));
            data.clearTimer.delete(node);
        }
        if (data.hoverTimer.has(node)) {
            clearTimeout(data.hoverTimer.get(node));
            data.hoverTimer.delete(node);
        }
    }
};
function CommonMactionMixin(Base) {
    return (function (_super) {
        __extends(CommonMactionMixin, _super);
        function CommonMactionMixin(factory, node, parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            var actions = _this.constructor
                .actions;
            var action = _this.node.attributes.get('actiontype');
            var _a = __read(actions.get(action) || [
                (function (_node, _data) { }),
                {},
            ], 2), handler = _a[0], data = _a[1];
            _this.action = handler;
            _this.data = data;
            _this.getParameters();
            return _this;
        }
        Object.defineProperty(CommonMactionMixin.prototype, "selected", {
            get: function () {
                var selection = this.node.attributes.get('selection');
                var i = Math.max(1, Math.min(this.childNodes.length, selection)) - 1;
                return (this.childNodes[i] || this.wrap(this.node.selected));
            },
            enumerable: false,
            configurable: true
        });
        CommonMactionMixin.prototype.getParameters = function () {
            var offsets = this.node.attributes.get('data-offsets');
            var _a = __read((0, string_js_1.split)(offsets || ''), 2), dx = _a[0], dy = _a[1];
            this.tipDx = this.length2em(dx || exports.TooltipData.dx);
            this.tipDy = this.length2em(dy || exports.TooltipData.dy);
        };
        CommonMactionMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            bbox.updateFrom(this.selected.getOuterBBox());
            this.selected.setChildPWidths(recompute);
        };
        Object.defineProperty(CommonMactionMixin.prototype, "breakCount", {
            get: function () {
                return this.node.isEmbellished
                    ? this.selected.coreMO().embellishedBreakCount
                    : this.selected.breakCount;
            },
            enumerable: false,
            configurable: true
        });
        CommonMactionMixin.prototype.computeLineBBox = function (i) {
            return this.getChildLineBBox(this.selected, i);
        };
        return CommonMactionMixin;
    }(Base));
}
//# sourceMappingURL=maction.js.map