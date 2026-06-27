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
exports.ChtmlWrapperFactory = void 0;
var WrapperFactory_js_1 = require("../common/WrapperFactory.js");
var Wrappers_js_1 = require("./Wrappers.js");
var ChtmlWrapperFactory = (function (_super) {
    __extends(ChtmlWrapperFactory, _super);
    function ChtmlWrapperFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChtmlWrapperFactory.defaultNodes = Wrappers_js_1.ChtmlWrappers;
    return ChtmlWrapperFactory;
}(WrapperFactory_js_1.CommonWrapperFactory));
exports.ChtmlWrapperFactory = ChtmlWrapperFactory;
//# sourceMappingURL=WrapperFactory.js.map