"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFont = loadFont;
require("./lib/chtml.js");
var chtml_js_1 = require("#js/output/chtml.js");
var DefaultFont_js_1 = require("#js/output/chtml/DefaultFont.js");
var util_js_1 = require("../util.js");
util_js_1.OutputUtil.config('chtml', chtml_js_1.CHTML, DefaultFont_js_1.fontName, DefaultFont_js_1.DefaultFont);
function loadFont(startup, preload) {
    return util_js_1.OutputUtil.loadFont(startup, 'chtml', DefaultFont_js_1.fontName, preload);
}
