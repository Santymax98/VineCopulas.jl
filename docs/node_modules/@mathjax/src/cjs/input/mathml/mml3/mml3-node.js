"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransform = createTransform;
var root_js_1 = require("#root/root.js");
function createTransform() {
    var nodeRequire = eval('require');
    try {
        nodeRequire.resolve('saxon-js');
    }
    catch (_err) {
        throw Error('Saxon-js not found.  Run the command:\n    npm install saxon-js\nand try again.');
    }
    var Saxon = nodeRequire('saxon-js');
    var path = nodeRequire('path');
    var xslt = nodeRequire(path.resolve((0, root_js_1.mjxRoot)(), 'input', 'mml', 'extensions', 'mml3.sef.json'));
    return function (node, doc) {
        var adaptor = doc.adaptor;
        var mml = adaptor.outerHTML(node);
        if (!mml.match(/ xmlns[=:]/)) {
            mml = mml.replace(/<(?:(\w+)(:))?math/, '<$1$2math xmlns$2$1="http://www.w3.org/1998/Math/MathML"');
        }
        var result;
        try {
            result = adaptor.firstChild(adaptor.body(adaptor.parse(Saxon.transform({
                stylesheetInternal: xslt,
                sourceText: mml,
                destination: 'serialized',
            }).principalResult)));
        }
        catch (_err) {
            result = node;
        }
        return result;
    };
}
//# sourceMappingURL=mml3-node.js.map