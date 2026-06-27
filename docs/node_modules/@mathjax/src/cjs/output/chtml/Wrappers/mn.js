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
exports.ChtmlMn = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mn_js_1 = require("../../common/Wrappers/mn.js");
var mn_js_2 = require("../../../core/MmlTree/MmlNodes/mn.js");
exports.ChtmlMn = (function () {
    var _a;
    var Base = (0, mn_js_1.CommonMnMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMn, _super);
            function ChtmlMn() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ChtmlMn;
        }(Base)),
        _a.kind = mn_js_2.MmlMn.prototype.kind,
        _a;
})();
//# sourceMappingURL=mn.js.map