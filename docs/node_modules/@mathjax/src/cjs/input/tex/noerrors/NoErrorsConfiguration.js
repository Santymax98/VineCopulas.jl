"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoErrorsConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
function noErrors(factory, message, _id, expr) {
    var mtext = factory.create('token', 'mtext', {}, expr.replace(/\n/g, ' '));
    var error = factory.create('node', 'merror', [mtext], {
        'data-mjx-error': message,
        title: message,
    });
    return error;
}
exports.NoErrorsConfiguration = Configuration_js_1.Configuration.create('noerrors', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.NODES] = { error: noErrors },
    _a));
//# sourceMappingURL=NoErrorsConfiguration.js.map