"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/mml3.js");
var mml3_js_1 = require("#js/input/mathml/mml3/mml3.js");
if (MathJax.startup) {
    MathJax.startup.extendHandler(function (handler) { return (0, mml3_js_1.Mml3Handler)(handler); });
}
