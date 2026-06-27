"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTeX = registerTeX;
var Options_js_1 = require("#js/util/Options.js");
function registerTeX(packageList, tex) {
    if (packageList === void 0) { packageList = []; }
    if (tex === void 0) { tex = true; }
    if (MathJax.startup) {
        if (tex) {
            MathJax.startup.registerConstructor('tex', MathJax._.input.tex_ts.TeX);
            MathJax.startup.useInput('tex');
        }
        if (!MathJax.config.tex) {
            MathJax.config.tex = {};
        }
        var packages = MathJax.config.tex.packages;
        MathJax.config.tex.packages = packageList;
        if (packages) {
            if (Array.isArray(packages)) {
                packages = { '[+]': packages.filter(function (name) { return !packageList.includes(name); }) };
            }
            (0, Options_js_1.insert)(MathJax.config.tex, { packages: packages });
        }
    }
}
