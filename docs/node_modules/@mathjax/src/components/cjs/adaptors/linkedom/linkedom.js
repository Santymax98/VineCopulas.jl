"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/linkedom.js");
var linkedomAdaptor_js_1 = require("#js/adaptors/linkedomAdaptor.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('linkedomAdaptor', function (options) { return (0, linkedomAdaptor_js_1.linkedomAdaptor)(MathJax.config.LINKEDOM, options); });
    MathJax.startup.useAdaptor('linkedomAdaptor', true);
}
