"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMac = void 0;
exports.copyToClipboard = copyToClipboard;
var context_js_1 = require("../../util/context.js");
exports.isMac = context_js_1.context.os === 'MacOS';
function copyToClipboard(text) {
    var document = context_js_1.context.document;
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText =
        'height: 1px; width: 1px; padding: 1px; position: absolute; left: -10px';
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
    }
    catch (error) {
        alert("Can't copy to clipboard: ".concat(error.message));
    }
    document.body.removeChild(input);
}
//# sourceMappingURL=MenuUtil.js.map