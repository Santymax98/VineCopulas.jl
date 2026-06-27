"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserAdaptor = browserAdaptor;
var HTMLAdaptor_js_1 = require("./HTMLAdaptor.js");
function browserAdaptor() {
    return new HTMLAdaptor_js_1.HTMLAdaptor(window);
}
//# sourceMappingURL=browserAdaptor.js.map