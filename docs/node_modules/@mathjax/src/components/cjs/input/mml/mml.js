"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var init_js_1 = require("./init.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('mml', init_js_1.MathML);
    MathJax.startup.useInput('mml');
}
