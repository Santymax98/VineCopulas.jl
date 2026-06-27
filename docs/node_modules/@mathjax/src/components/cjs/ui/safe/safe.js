"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/safe.js");
var SafeHandler_js_1 = require("#js/ui/safe/SafeHandler.js");
if (MathJax.startup) {
    MathJax.startup.extendHandler(function (handler) { return (0, SafeHandler_js_1.SafeHandler)(handler); });
}
