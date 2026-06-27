"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/jsdom.js");
var jsdomAdaptor_js_1 = require("#js/adaptors/jsdomAdaptor.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('jsdomAdaptor', function (options) { return (0, jsdomAdaptor_js_1.jsdomAdaptor)(MathJax.config.JSDOM, options); });
    MathJax.startup.useAdaptor('jsdomAdaptor', true);
}
