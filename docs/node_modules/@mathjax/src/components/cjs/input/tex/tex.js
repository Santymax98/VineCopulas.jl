"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/tex.js");
var register_js_1 = require("./register.js");
var loader_js_1 = require("#js/components/loader.js");
loader_js_1.Loader.preLoaded('input/tex-base', '[tex]/ams', '[tex]/newcommand', '[tex]/textmacros', '[tex]/noundefined', '[tex]/require', '[tex]/autoload', '[tex]/configmacros');
(0, register_js_1.registerTeX)([
    'base',
    'ams',
    'newcommand',
    'textmacros',
    'noundefined',
    'require',
    'autoload',
    'configmacros'
]);
