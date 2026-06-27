"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var PhysicsItems_js_1 = require("./PhysicsItems.js");
require("./PhysicsMappings.js");
exports.PhysicsConfiguration = Configuration_js_1.Configuration.create('physics', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {
            macro: [
                'Physics-automatic-bracing-macros',
                'Physics-vector-macros',
                'Physics-vector-mo',
                'Physics-vector-mi',
                'Physics-derivative-macros',
                'Physics-expressions-macros',
                'Physics-quick-quad-macros',
                'Physics-bra-ket-macros',
                'Physics-matrix-macros',
            ]
        },
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['Physics-characters'],
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['Physics-aux-envs'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_c = {},
        _c[PhysicsItems_js_1.AutoOpen.prototype.kind] = PhysicsItems_js_1.AutoOpen,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        physics: {
            italicdiff: false,
            arrowdel: false,
        },
    },
    _a));
//# sourceMappingURL=PhysicsConfiguration.js.map