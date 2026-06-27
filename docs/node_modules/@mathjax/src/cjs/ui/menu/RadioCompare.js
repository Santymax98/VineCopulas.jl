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
exports.RadioCompare = void 0;
var mj_context_menu_js_1 = require("./mj-context-menu.js");
var RadioCompare = (function (_super) {
    __extends(RadioCompare, _super);
    function RadioCompare(menu, content, variable, id, comparator) {
        var _this = _super.call(this, menu, content, variable, id) || this;
        _this.comparator = comparator;
        _this.role = 'menuitemradiocompare';
        return _this;
    }
    RadioCompare.fromJson = function (_factory, _a, menu) {
        var content = _a.content, variable = _a.variable, id = _a.id, comparator = _a.comparator;
        return new this(menu, content, variable, id, comparator);
    };
    RadioCompare.prototype.updateAria = function () {
        this.html.setAttribute('aria-checked', this.comparator(this.variable.getValue(), this.id) ? 'true' : 'false');
    };
    RadioCompare.prototype.updateSpan = function () {
        this.span.style.display = this.comparator(this.variable.getValue(), this.id)
            ? ''
            : 'none';
    };
    return RadioCompare;
}(mj_context_menu_js_1.Radio));
exports.RadioCompare = RadioCompare;
//# sourceMappingURL=RadioCompare.js.map