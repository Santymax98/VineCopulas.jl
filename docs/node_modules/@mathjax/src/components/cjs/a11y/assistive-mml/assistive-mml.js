"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/assistive-mml.js");
var global_js_1 = require("#js/components/global.js");
var assistive_mml_js_1 = require("#js/a11y/assistive-mml.js");
if (MathJax.startup) {
    if (MathJax.config.options && MathJax.config.options.enableAssistiveMml !== false) {
        (0, global_js_1.combineDefaults)(MathJax.config, 'options', {
            menuOptions: {
                settings: {
                    assistiveMml: true
                }
            }
        });
    }
    MathJax.startup.extendHandler(function (handler) { return (0, assistive_mml_js_1.AssistiveMmlHandler)(handler); });
}
