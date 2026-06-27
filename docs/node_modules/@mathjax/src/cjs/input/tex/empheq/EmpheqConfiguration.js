"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpheqConfiguration = exports.EmpheqMethods = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var EmpheqUtil_js_1 = require("./EmpheqUtil.js");
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
exports.EmpheqMethods = {
    Empheq: function (parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory
                .create('end')
                .setProperty('name', parser.stack.global.empheq));
            parser.stack.global.empheq = '';
            var empheq = parser.stack.Top();
            EmpheqUtil_js_1.EmpheqUtil.adjustTable(empheq, parser);
            parser.Push(parser.itemFactory.create('end').setProperty('name', 'empheq'));
        }
        else {
            ParseUtil_js_1.ParseUtil.checkEqnEnv(parser);
            var opts = parser.GetBrackets('\\begin{' + begin.getName() + '}') || '';
            var _a = __read(parser
                .GetArgument('\\begin{' + begin.getName() + '}')
                .split(/=/), 2), env = _a[0], n = _a[1];
            if (!EmpheqUtil_js_1.EmpheqUtil.checkEnv(env)) {
                throw new TexError_js_1.default('EmpheqInvalidEnv', 'Invalid environment "%1" for %2', env, begin.getName());
            }
            begin.setProperty('nestStart', true);
            if (opts) {
                begin.setProperties(EmpheqUtil_js_1.EmpheqUtil.splitOptions(opts, { left: 1, right: 1 }));
            }
            parser.stack.global.empheq = env;
            parser.string =
                '\\begin{' +
                    env +
                    '}' +
                    (n ? '{' + n + '}' : '') +
                    parser.string.slice(parser.i);
            parser.i = 0;
            parser.Push(begin);
        }
    },
    EmpheqMO: function (parser, _name, c) {
        parser.Push(parser.create('token', 'mo', {}, c));
    },
    EmpheqDelim: function (parser, name) {
        var c = parser.GetDelimiter(name);
        parser.Push(parser.create('token', 'mo', { stretchy: true, symmetric: true }, c));
    },
};
new TokenMap_js_1.EnvironmentMap('empheq-env', ParseMethods_js_1.default.environment, {
    empheq: [exports.EmpheqMethods.Empheq, 'empheq'],
});
new TokenMap_js_1.CommandMap('empheq-macros', {
    empheqlbrace: [exports.EmpheqMethods.EmpheqMO, '{'],
    empheqrbrace: [exports.EmpheqMethods.EmpheqMO, '}'],
    empheqlbrack: [exports.EmpheqMethods.EmpheqMO, '['],
    empheqrbrack: [exports.EmpheqMethods.EmpheqMO, ']'],
    empheqlangle: [exports.EmpheqMethods.EmpheqMO, '\u27E8'],
    empheqrangle: [exports.EmpheqMethods.EmpheqMO, '\u27E9'],
    empheqlparen: [exports.EmpheqMethods.EmpheqMO, '('],
    empheqrparen: [exports.EmpheqMethods.EmpheqMO, ')'],
    empheqlvert: [exports.EmpheqMethods.EmpheqMO, '|'],
    empheqrvert: [exports.EmpheqMethods.EmpheqMO, '|'],
    empheqlVert: [exports.EmpheqMethods.EmpheqMO, '\u2016'],
    empheqrVert: [exports.EmpheqMethods.EmpheqMO, '\u2016'],
    empheqlfloor: [exports.EmpheqMethods.EmpheqMO, '\u230A'],
    empheqrfloor: [exports.EmpheqMethods.EmpheqMO, '\u230B'],
    empheqlceil: [exports.EmpheqMethods.EmpheqMO, '\u2308'],
    empheqrceil: [exports.EmpheqMethods.EmpheqMO, '\u2309'],
    empheqbiglbrace: [exports.EmpheqMethods.EmpheqMO, '{'],
    empheqbigrbrace: [exports.EmpheqMethods.EmpheqMO, '}'],
    empheqbiglbrack: [exports.EmpheqMethods.EmpheqMO, '['],
    empheqbigrbrack: [exports.EmpheqMethods.EmpheqMO, ']'],
    empheqbiglangle: [exports.EmpheqMethods.EmpheqMO, '\u27E8'],
    empheqbigrangle: [exports.EmpheqMethods.EmpheqMO, '\u27E9'],
    empheqbiglparen: [exports.EmpheqMethods.EmpheqMO, '('],
    empheqbigrparen: [exports.EmpheqMethods.EmpheqMO, ')'],
    empheqbiglvert: [exports.EmpheqMethods.EmpheqMO, '|'],
    empheqbigrvert: [exports.EmpheqMethods.EmpheqMO, '|'],
    empheqbiglVert: [exports.EmpheqMethods.EmpheqMO, '\u2016'],
    empheqbigrVert: [exports.EmpheqMethods.EmpheqMO, '\u2016'],
    empheqbiglfloor: [exports.EmpheqMethods.EmpheqMO, '\u230A'],
    empheqbigrfloor: [exports.EmpheqMethods.EmpheqMO, '\u230B'],
    empheqbiglceil: [exports.EmpheqMethods.EmpheqMO, '\u2308'],
    empheqbigrceil: [exports.EmpheqMethods.EmpheqMO, '\u2309'],
    empheql: exports.EmpheqMethods.EmpheqDelim,
    empheqr: exports.EmpheqMethods.EmpheqDelim,
    empheqbigl: exports.EmpheqMethods.EmpheqDelim,
    empheqbigr: exports.EmpheqMethods.EmpheqDelim,
});
exports.EmpheqConfiguration = Configuration_js_1.Configuration.create('empheq', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['empheq-macros'],
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['empheq-env'],
        _b),
    _a));
//# sourceMappingURL=EmpheqConfiguration.js.map