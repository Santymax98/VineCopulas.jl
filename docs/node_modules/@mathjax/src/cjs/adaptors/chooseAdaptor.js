"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseAdaptor = void 0;
var liteAdaptor_js_1 = require("./liteAdaptor.js");
var browserAdaptor_js_1 = require("./browserAdaptor.js");
var context_js_1 = require("../util/context.js");
exports.chooseAdaptor = context_js_1.context.document ? browserAdaptor_js_1.browserAdaptor : liteAdaptor_js_1.liteAdaptor;
//# sourceMappingURL=chooseAdaptor.js.map