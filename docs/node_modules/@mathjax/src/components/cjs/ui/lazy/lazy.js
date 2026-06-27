"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/lazy.js");
var LazyHandler_js_1 = require("#js/ui/lazy/LazyHandler.js");
if (MathJax.startup) {
    MathJax.startup.extendHandler(function (handler) { return (0, LazyHandler_js_1.LazyHandler)(handler); });
}
