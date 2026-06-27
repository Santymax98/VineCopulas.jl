"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/explorer.js");
var explorer_js_1 = require("#js/a11y/explorer.js");
var context_js_1 = require("#js/util/context.js");
if (MathJax.startup && context_js_1.hasWindow) {
    MathJax.startup.extendHandler(function (handler) { return (0, explorer_js_1.ExplorerHandler)(handler); });
}
