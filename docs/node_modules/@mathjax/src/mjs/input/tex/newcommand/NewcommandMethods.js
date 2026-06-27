import { HandlerType } from '../HandlerTypes.js';
import TexError from '../TexError.js';
import * as sm from '../TokenMap.js';
import BaseMethods from '../base/BaseMethods.js';
import { ParseUtil } from '../ParseUtil.js';
import { UnitUtil } from '../UnitUtil.js';
import { NewcommandUtil } from './NewcommandUtil.js';
const NewcommandMethods = {
    NewCommand(parser, name) {
        const cs = NewcommandUtil.GetCsNameArgument(parser, name);
        const n = NewcommandUtil.GetArgCount(parser, name);
        const opt = parser.GetBrackets(name);
        const def = parser.GetArgument(name);
        NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [def, n, opt]);
        parser.Push(parser.itemFactory.create('null'));
    },
    NewEnvironment(parser, name) {
        const env = UnitUtil.trimSpaces(parser.GetArgument(name));
        const n = NewcommandUtil.GetArgCount(parser, name);
        const opt = parser.GetBrackets(name);
        const bdef = parser.GetArgument(name);
        const edef = parser.GetArgument(name);
        NewcommandUtil.addEnvironment(parser, env, NewcommandMethods.BeginEnv, [
            true,
            bdef,
            edef,
            n,
            opt,
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    MacroDef(parser, name) {
        const cs = NewcommandUtil.GetCSname(parser, name);
        const params = NewcommandUtil.GetTemplate(parser, name, '\\' + cs);
        const def = parser.GetArgument(name);
        !(params instanceof Array)
            ?
                NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [
                    def,
                    params,
                ])
            :
                NewcommandUtil.addMacro(parser, cs, NewcommandMethods.MacroWithTemplate, [def].concat(params));
        parser.Push(parser.itemFactory.create('null'));
    },
    Let(parser, name) {
        const cs = NewcommandUtil.GetCSname(parser, name);
        let c = parser.GetNext();
        if (c === '=') {
            parser.i++;
            c = parser.GetNext();
        }
        const handlers = parser.configuration.handlers;
        parser.Push(parser.itemFactory.create('null'));
        if (c === '\\') {
            name = NewcommandUtil.GetCSname(parser, name);
            if (cs === name) {
                return;
            }
            const map = handlers.get(HandlerType.MACRO).applicable(name);
            if (map instanceof sm.MacroMap) {
                const macro = map.lookup(name);
                NewcommandUtil.addMacro(parser, cs, macro.func, macro.args, macro.token);
                return;
            }
            if (map instanceof sm.CharacterMap && !(map instanceof sm.DelimiterMap)) {
                const macro = map.lookup(name);
                const method = (p) => map.parser(p, macro);
                NewcommandUtil.addMacro(parser, cs, method, [cs, macro.char]);
                return;
            }
            const macro = handlers
                .get(HandlerType.DELIMITER)
                .lookup('\\' + name);
            if (macro) {
                NewcommandUtil.addDelimiter(parser, '\\' + cs, macro.char, macro.attributes);
                return;
            }
            NewcommandUtil.checkProtectedMacros(parser, cs);
            NewcommandUtil.undefineMacro(parser, cs);
            NewcommandUtil.undefineDelimiter(parser, '\\' + cs);
            return;
        }
        parser.i++;
        const macro = handlers.get(HandlerType.DELIMITER).lookup(c);
        if (macro) {
            NewcommandUtil.addDelimiter(parser, '\\' + cs, macro.char, macro.attributes);
            return;
        }
        NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [c]);
    },
    MacroWithTemplate(parser, name, text, n, ...params) {
        const argCount = parseInt(n, 10);
        if (params.length) {
            const args = [];
            parser.GetNext();
            if (params[0] && !NewcommandUtil.MatchParam(parser, params[0])) {
                throw new TexError('MismatchUseDef', "Use of %1 doesn't match its definition", name);
            }
            if (argCount) {
                for (let i = 0; i < argCount; i++) {
                    args.push(NewcommandUtil.GetParameter(parser, name, params[i + 1]));
                }
                text = ParseUtil.substituteArgs(parser, args, text);
            }
        }
        parser.string = ParseUtil.addArgs(parser, text, parser.string.slice(parser.i));
        parser.i = 0;
        ParseUtil.checkMaxMacros(parser);
    },
    BeginEnv(parser, begin, bdef, edef, n, def) {
        const name = begin.getName();
        if (parser.stack.env['closing'] === name) {
            delete parser.stack.env['closing'];
            const beginN = parser.stack.global['beginEnv'];
            if (beginN) {
                parser.stack.global['beginEnv']--;
                if (edef) {
                    const rest = parser.string.slice(parser.i);
                    parser.string = ParseUtil.addArgs(parser, parser.string.substring(0, parser.i), edef);
                    parser.Parse();
                    parser.string = rest;
                    parser.i = 0;
                }
            }
            return parser.itemFactory.create('end').setProperty('name', name);
        }
        if (n) {
            const args = [];
            if (def != null) {
                const optional = parser.GetBrackets(`\\begin{${name}}`);
                args.push(optional == null ? def : optional);
            }
            for (let i = args.length; i < n; i++) {
                args.push(parser.GetArgument(`\\begin{${name}}`));
            }
            bdef = ParseUtil.substituteArgs(parser, args, bdef);
            edef = ParseUtil.substituteArgs(parser, [], edef);
        }
        parser.string = ParseUtil.addArgs(parser, bdef, parser.string.slice(parser.i));
        parser.i = 0;
        parser.stack.global['beginEnv'] =
            (parser.stack.global['beginEnv'] || 0) + 1;
        return parser.itemFactory.create('beginEnv').setProperty('name', name);
    },
    Macro: BaseMethods.Macro,
};
export default NewcommandMethods;
//# sourceMappingURL=NewcommandMethods.js.map