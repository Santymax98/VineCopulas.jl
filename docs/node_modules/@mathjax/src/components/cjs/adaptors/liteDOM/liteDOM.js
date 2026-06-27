"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/liteDOM.js");
var liteAdaptor_js_1 = require("#js/adaptors/liteAdaptor.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('liteAdaptor', liteAdaptor_js_1.liteAdaptor);
    MathJax.startup.useAdaptor('liteAdaptor', true);
}
