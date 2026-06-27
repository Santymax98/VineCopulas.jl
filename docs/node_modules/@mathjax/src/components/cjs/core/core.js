"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/core.js");
var HTMLHandler_js_1 = require("#js/handlers/html/HTMLHandler.js");
var browserAdaptor_js_1 = require("#js/adaptors/browserAdaptor.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('HTMLHandler', HTMLHandler_js_1.HTMLHandler);
    MathJax.startup.registerConstructor('browserAdaptor', browserAdaptor_js_1.browserAdaptor);
    MathJax.startup.useHandler('HTMLHandler');
    MathJax.startup.useAdaptor('browserAdaptor');
}
if (MathJax.loader) {
    var config_1 = MathJax.config.loader;
    MathJax._.mathjax.mathjax.asyncLoad = (function (name) { return name.substring(0, 5) === 'node:'
        ? config_1.require(name)
        : MathJax.loader.load(name).then(function (result) { return result[0]; }); });
}
