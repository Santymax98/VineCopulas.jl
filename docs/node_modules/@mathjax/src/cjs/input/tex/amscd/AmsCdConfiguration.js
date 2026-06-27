"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmsCdConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
require("./AmsCdMappings.js");
exports.AmsCdConfiguration = Configuration_js_1.Configuration.create('amscd', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['amscd_special'],
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['amscd_macros'],
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['amscd_environment'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        amscd: {
            colspace: '5pt',
            rowspace: '5pt',
            harrowsize: '2.75em',
            varrowsize: '1.75em',
            hideHorizontalLabels: false,
        },
    },
    _a));
//# sourceMappingURL=AmsCdConfiguration.js.map