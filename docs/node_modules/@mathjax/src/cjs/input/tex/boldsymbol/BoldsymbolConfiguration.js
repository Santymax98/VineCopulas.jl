"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoldsymbolConfiguration = exports.BoldsymbolMethods = void 0;
exports.createBoldToken = createBoldToken;
exports.rewriteBoldTokens = rewriteBoldTokens;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var TexConstants_js_1 = require("../TexConstants.js");
var TokenMap_js_1 = require("../TokenMap.js");
var NodeFactory_js_1 = require("../NodeFactory.js");
var BOLDVARIANT = {};
BOLDVARIANT[TexConstants_js_1.TexConstant.Variant.NORMAL] = TexConstants_js_1.TexConstant.Variant.BOLD;
BOLDVARIANT[TexConstants_js_1.TexConstant.Variant.ITALIC] = TexConstants_js_1.TexConstant.Variant.BOLDITALIC;
BOLDVARIANT[TexConstants_js_1.TexConstant.Variant.FRAKTUR] = TexConstants_js_1.TexConstant.Variant.BOLDFRAKTUR;
BOLDVARIANT[TexConstants_js_1.TexConstant.Variant.SCRIPT] = TexConstants_js_1.TexConstant.Variant.BOLDSCRIPT;
BOLDVARIANT[TexConstants_js_1.TexConstant.Variant.SANSSERIF] = TexConstants_js_1.TexConstant.Variant.BOLDSANSSERIF;
BOLDVARIANT['-tex-calligraphic'] = '-tex-bold-calligraphic';
BOLDVARIANT['-tex-oldstyle'] = '-tex-bold-oldstyle';
BOLDVARIANT['-tex-mathit'] = TexConstants_js_1.TexConstant.Variant.BOLDITALIC;
exports.BoldsymbolMethods = {
    Boldsymbol: function (parser, name) {
        var boldsymbol = parser.stack.env['boldsymbol'];
        parser.stack.env['boldsymbol'] = true;
        var mml = parser.ParseArg(name);
        parser.stack.env['boldsymbol'] = boldsymbol;
        parser.Push(mml);
    },
};
new TokenMap_js_1.CommandMap('boldsymbol', { boldsymbol: exports.BoldsymbolMethods.Boldsymbol });
function createBoldToken(factory, kind, def, text) {
    var token = NodeFactory_js_1.NodeFactory.createToken(factory, kind, def, text);
    if (kind !== 'mtext' &&
        factory.configuration.parser.stack.env['boldsymbol']) {
        NodeUtil_js_1.default.setProperty(token, 'fixBold', true);
        factory.configuration.addNode('fixBold', token);
    }
    return token;
}
function rewriteBoldTokens(arg) {
    var e_1, _a;
    try {
        for (var _b = __values(arg.data.getList('fixBold')), _c = _b.next(); !_c.done; _c = _b.next()) {
            var node = _c.value;
            if (NodeUtil_js_1.default.getProperty(node, 'fixBold')) {
                var variant = NodeUtil_js_1.default.getAttribute(node, 'mathvariant');
                NodeUtil_js_1.default.setAttribute(node, 'mathvariant', BOLDVARIANT[variant] || variant);
                NodeUtil_js_1.default.removeProperties(node, 'fixBold');
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.BoldsymbolConfiguration = Configuration_js_1.Configuration.create('boldsymbol', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['boldsymbol'], _b),
    _a[HandlerTypes_js_1.ConfigurationType.NODES] = { token: createBoldToken },
    _a[HandlerTypes_js_1.ConfigurationType.POSTPROCESSORS] = [rewriteBoldTokens],
    _a));
//# sourceMappingURL=BoldsymbolConfiguration.js.map