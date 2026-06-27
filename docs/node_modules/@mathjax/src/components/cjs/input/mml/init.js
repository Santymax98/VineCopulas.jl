"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathML = void 0;
require("./lib/mml.js");
var mathml_js_1 = require("#js/input/mathml.js");
Object.defineProperty(exports, "MathML", { enumerable: true, get: function () { return mathml_js_1.MathML; } });
if (MathJax.loader) {
    MathJax.loader.pathFilters.add(function (data) {
        data.name = data.name.replace(/\/util\/entities\/.*?\.js/, '/input/mml/entities.js');
        return true;
    });
}
