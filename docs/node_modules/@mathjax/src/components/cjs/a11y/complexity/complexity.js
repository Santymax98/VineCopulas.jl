"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/complexity.js");
var global_js_1 = require("#js/components/global.js");
var complexity_js_1 = require("#js/a11y/complexity.js");
if (MathJax.startup) {
    MathJax.startup.extendHandler(function (handler) { return (0, complexity_js_1.ComplexityHandler)(handler); });
    (0, global_js_1.combineDefaults)(MathJax.config, 'options', MathJax.config['a11y/complexity'] || {});
}
