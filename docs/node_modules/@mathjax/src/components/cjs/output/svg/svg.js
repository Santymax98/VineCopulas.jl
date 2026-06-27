"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFont = loadFont;
require("./lib/svg.js");
var svg_js_1 = require("#js/output/svg.js");
var DefaultFont_js_1 = require("#js/output/svg/DefaultFont.js");
var util_js_1 = require("../util.js");
util_js_1.OutputUtil.config('svg', svg_js_1.SVG, DefaultFont_js_1.fontName, DefaultFont_js_1.DefaultFont);
function loadFont(startup, preload) {
    return util_js_1.OutputUtil.loadFont(startup, 'svg', DefaultFont_js_1.fontName, preload);
}
