"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/semantic-enrich.js");
var global_js_1 = require("#js/components/global.js");
var semantic_enrich_js_1 = require("#js/a11y/semantic-enrich.js");
var mathml_js_1 = require("#js/input/mathml.js");
if (MathJax.startup) {
    MathJax.startup.extendHandler(function (handler) { return (0, semantic_enrich_js_1.EnrichHandler)(handler, new mathml_js_1.MathML({ allowHtmlInTokenNodes: true })); });
}
