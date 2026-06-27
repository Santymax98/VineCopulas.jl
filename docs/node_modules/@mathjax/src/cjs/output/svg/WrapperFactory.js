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
exports.SvgWrapperFactory = void 0;
var WrapperFactory_js_1 = require("../common/WrapperFactory.js");
var Wrappers_js_1 = require("./Wrappers.js");
var SvgWrapperFactory = (function (_super) {
    __extends(SvgWrapperFactory, _super);
    function SvgWrapperFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SvgWrapperFactory.defaultNodes = Wrappers_js_1.SvgWrappers;
    return SvgWrapperFactory;
}(WrapperFactory_js_1.CommonWrapperFactory));
exports.SvgWrapperFactory = SvgWrapperFactory;
//# sourceMappingURL=WrapperFactory.js.map