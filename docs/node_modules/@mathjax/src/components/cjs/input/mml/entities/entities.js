"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("#js/util/entities/all.js");
var version_js_1 = require("#js/components/version.js");
if (MathJax.loader) {
    MathJax.loader.checkVersion('input/mml/entities', version_js_1.VERSION, 'input/mml/entities');
}
