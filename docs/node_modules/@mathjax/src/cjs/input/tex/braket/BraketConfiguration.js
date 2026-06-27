"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BraketConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var BraketItems_js_1 = require("./BraketItems.js");
require("./BraketMappings.js");
exports.BraketConfiguration = Configuration_js_1.Configuration.create('braket', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['Braket-characters'],
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['Braket-macros'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_c = {},
        _c[BraketItems_js_1.BraketItem.prototype.kind] = BraketItems_js_1.BraketItem,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.PRIORITY] = 3,
    _a));
//# sourceMappingURL=BraketConfiguration.js.map