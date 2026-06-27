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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var StackItem_js_1 = require("./StackItem.js");
var Factory_js_1 = require("../../core/Tree/Factory.js");
var DummyItem = (function (_super) {
    __extends(DummyItem, _super);
    function DummyItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DummyItem;
}(StackItem_js_1.BaseItem));
var StackItemFactory = (function (_super) {
    __extends(StackItemFactory, _super);
    function StackItemFactory() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.defaultKind = 'dummy';
        _this.configuration = null;
        return _this;
    }
    StackItemFactory.DefaultStackItems = (_a = {},
        _a[DummyItem.prototype.kind] = DummyItem,
        _a);
    return StackItemFactory;
}(Factory_js_1.AbstractFactory));
exports.default = StackItemFactory;
//# sourceMappingURL=StackItemFactory.js.map