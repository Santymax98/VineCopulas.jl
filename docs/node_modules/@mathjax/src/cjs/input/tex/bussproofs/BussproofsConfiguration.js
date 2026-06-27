"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BussproofsConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var BussproofsItems_js_1 = require("./BussproofsItems.js");
var BussproofsUtil_js_1 = require("./BussproofsUtil.js");
require("./BussproofsMappings.js");
exports.BussproofsConfiguration = Configuration_js_1.Configuration.create('bussproofs', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['Bussproofs-macros'],
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['Bussproofs-environments'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_c = {},
        _c[BussproofsItems_js_1.ProofTreeItem.prototype.kind] = BussproofsItems_js_1.ProofTreeItem,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.PREPROCESSORS] = [[BussproofsUtil_js_1.saveDocument, 1]],
    _a[HandlerTypes_js_1.ConfigurationType.POSTPROCESSORS] = [
        [BussproofsUtil_js_1.clearDocument, 3],
        [BussproofsUtil_js_1.makeBsprAttributes, 2],
        [BussproofsUtil_js_1.balanceRules, 1],
    ],
    _a));
//# sourceMappingURL=BussproofsConfiguration.js.map