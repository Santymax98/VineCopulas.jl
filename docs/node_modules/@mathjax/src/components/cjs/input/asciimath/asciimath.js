"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/asciimath.js");
var asciimath_js_1 = require("#js/input/asciimath.js");
if (MathJax.startup) {
    MathJax.startup.registerConstructor('asciimath', asciimath_js_1.AsciiMath);
    MathJax.startup.useInput('asciimath');
}
