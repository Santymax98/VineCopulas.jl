"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyAsciiMath = void 0;
var shim_js_1 = require("./legacy/shim.js");
var MmlFactory_js_1 = require("../../core/MmlTree/MmlFactory.js");
var factory = new MmlFactory_js_1.MmlFactory();
exports.LegacyAsciiMath = {
    Compile: function (am, display) {
        var script = {
            type: 'math/asciimath',
            innerText: am,
            MathJax: {},
        };
        var node = shim_js_1.AsciiMath.Translate(script).root.toMmlNode(factory);
        node.setInheritedAttributes({}, display, 0, false);
        return node;
    },
    Translate: function (am, display) {
        return this.Compile(am, display);
    },
};
//# sourceMappingURL=legacy.js.map