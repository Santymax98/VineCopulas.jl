"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var sm = __importStar(require("../TokenMap.js"));
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
var UnitUtil_js_1 = require("../UnitUtil.js");
var NewcommandUtil_js_1 = require("./NewcommandUtil.js");
var NewcommandMethods = {
    NewCommand: function (parser, name) {
        var cs = NewcommandUtil_js_1.NewcommandUtil.GetCsNameArgument(parser, name);
        var n = NewcommandUtil_js_1.NewcommandUtil.GetArgCount(parser, name);
        var opt = parser.GetBrackets(name);
        var def = parser.GetArgument(name);
        NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [def, n, opt]);
        parser.Push(parser.itemFactory.create('null'));
    },
    NewEnvironment: function (parser, name) {
        var env = UnitUtil_js_1.UnitUtil.trimSpaces(parser.GetArgument(name));
        var n = NewcommandUtil_js_1.NewcommandUtil.GetArgCount(parser, name);
        var opt = parser.GetBrackets(name);
        var bdef = parser.GetArgument(name);
        var edef = parser.GetArgument(name);
        NewcommandUtil_js_1.NewcommandUtil.addEnvironment(parser, env, NewcommandMethods.BeginEnv, [
            true,
            bdef,
            edef,
            n,
            opt,
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    MacroDef: function (parser, name) {
        var cs = NewcommandUtil_js_1.NewcommandUtil.GetCSname(parser, name);
        var params = NewcommandUtil_js_1.NewcommandUtil.GetTemplate(parser, name, '\\' + cs);
        var def = parser.GetArgument(name);
        !(params instanceof Array)
            ?
                NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [
                    def,
                    params,
                ])
            :
                NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, NewcommandMethods.MacroWithTemplate, [def].concat(params));
        parser.Push(parser.itemFactory.create('null'));
    },
    Let: function (parser, name) {
        var cs = NewcommandUtil_js_1.NewcommandUtil.GetCSname(parser, name);
        var c = parser.GetNext();
        if (c === '=') {
            parser.i++;
            c = parser.GetNext();
        }
        var handlers = parser.configuration.handlers;
        parser.Push(parser.itemFactory.create('null'));
        if (c === '\\') {
            name = NewcommandUtil_js_1.NewcommandUtil.GetCSname(parser, name);
            if (cs === name) {
                return;
            }
            var map_1 = handlers.get(HandlerTypes_js_1.HandlerType.MACRO).applicable(name);
            if (map_1 instanceof sm.MacroMap) {
                var macro_1 = map_1.lookup(name);
                NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, macro_1.func, macro_1.args, macro_1.token);
                return;
            }
            if (map_1 instanceof sm.CharacterMap && !(map_1 instanceof sm.DelimiterMap)) {
                var macro_2 = map_1.lookup(name);
                var method = function (p) { return map_1.parser(p, macro_2); };
                NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, method, [cs, macro_2.char]);
                return;
            }
            var macro_3 = handlers
                .get(HandlerTypes_js_1.HandlerType.DELIMITER)
                .lookup('\\' + name);
            if (macro_3) {
                NewcommandUtil_js_1.NewcommandUtil.addDelimiter(parser, '\\' + cs, macro_3.char, macro_3.attributes);
                return;
            }
            NewcommandUtil_js_1.NewcommandUtil.checkProtectedMacros(parser, cs);
            NewcommandUtil_js_1.NewcommandUtil.undefineMacro(parser, cs);
            NewcommandUtil_js_1.NewcommandUtil.undefineDelimiter(parser, '\\' + cs);
            return;
        }
        parser.i++;
        var macro = handlers.get(HandlerTypes_js_1.HandlerType.DELIMITER).lookup(c);
        if (macro) {
            NewcommandUtil_js_1.NewcommandUtil.addDelimiter(parser, '\\' + cs, macro.char, macro.attributes);
            return;
        }
        NewcommandUtil_js_1.NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [c]);
    },
    MacroWithTemplate: function (parser, name, text, n) {
        var params = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            params[_i - 4] = arguments[_i];
        }
        var argCount = parseInt(n, 10);
        if (params.length) {
            var args = [];
            parser.GetNext();
            if (params[0] && !NewcommandUtil_js_1.NewcommandUtil.MatchParam(parser, params[0])) {
                throw new TexError_js_1.default('MismatchUseDef', "Use of %1 doesn't match its definition", name);
            }
            if (argCount) {
                for (var i = 0; i < argCount; i++) {
                    args.push(NewcommandUtil_js_1.NewcommandUtil.GetParameter(parser, name, params[i + 1]));
                }
                text = ParseUtil_js_1.ParseUtil.substituteArgs(parser, args, text);
            }
        }
        parser.string = ParseUtil_js_1.ParseUtil.addArgs(parser, text, parser.string.slice(parser.i));
        parser.i = 0;
        ParseUtil_js_1.ParseUtil.checkMaxMacros(parser);
    },
    BeginEnv: function (parser, begin, bdef, edef, n, def) {
        var name = begin.getName();
        if (parser.stack.env['closing'] === name) {
            delete parser.stack.env['closing'];
            var beginN = parser.stack.global['beginEnv'];
            if (beginN) {
                parser.stack.global['beginEnv']--;
                if (edef) {
                    var rest = parser.string.slice(parser.i);
                    parser.string = ParseUtil_js_1.ParseUtil.addArgs(parser, parser.string.substring(0, parser.i), edef);
                    parser.Parse();
                    parser.string = rest;
                    parser.i = 0;
                }
            }
            return parser.itemFactory.create('end').setProperty('name', name);
        }
        if (n) {
            var args = [];
            if (def != null) {
                var optional = parser.GetBrackets("\\begin{".concat(name, "}"));
                args.push(optional == null ? def : optional);
            }
            for (var i = args.length; i < n; i++) {
                args.push(parser.GetArgument("\\begin{".concat(name, "}")));
            }
            bdef = ParseUtil_js_1.ParseUtil.substituteArgs(parser, args, bdef);
            edef = ParseUtil_js_1.ParseUtil.substituteArgs(parser, [], edef);
        }
        parser.string = ParseUtil_js_1.ParseUtil.addArgs(parser, bdef, parser.string.slice(parser.i));
        parser.i = 0;
        parser.stack.global['beginEnv'] =
            (parser.stack.global['beginEnv'] || 0) + 1;
        return parser.itemFactory.create('beginEnv').setProperty('name', name);
    },
    Macro: BaseMethods_js_1.default.Macro,
};
exports.default = NewcommandMethods;
//# sourceMappingURL=NewcommandMethods.js.map