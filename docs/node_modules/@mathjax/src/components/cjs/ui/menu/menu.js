"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/menu.js");
var global_js_1 = require("#js/components/global.js");
var MenuHandler_js_1 = require("#js/ui/menu/MenuHandler.js");
var context_js_1 = require("#js/util/context.js");
if (MathJax.startup && context_js_1.hasWindow) {
    MathJax.startup.extendHandler(function (handler) { return (0, MenuHandler_js_1.MenuHandler)(handler); }, 20);
}
