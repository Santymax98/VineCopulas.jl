import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap, EnvironmentMap } from '../TokenMap.js';
import { ParseUtil } from '../ParseUtil.js';
import TexError from '../TexError.js';
import { EmpheqUtil } from './EmpheqUtil.js';
import ParseMethods from '../ParseMethods.js';
export const EmpheqMethods = {
    Empheq(parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory
                .create('end')
                .setProperty('name', parser.stack.global.empheq));
            parser.stack.global.empheq = '';
            const empheq = parser.stack.Top();
            EmpheqUtil.adjustTable(empheq, parser);
            parser.Push(parser.itemFactory.create('end').setProperty('name', 'empheq'));
        }
        else {
            ParseUtil.checkEqnEnv(parser);
            const opts = parser.GetBrackets('\\begin{' + begin.getName() + '}') || '';
            const [env, n] = parser
                .GetArgument('\\begin{' + begin.getName() + '}')
                .split(/=/);
            if (!EmpheqUtil.checkEnv(env)) {
                throw new TexError('EmpheqInvalidEnv', 'Invalid environment "%1" for %2', env, begin.getName());
            }
            begin.setProperty('nestStart', true);
            if (opts) {
                begin.setProperties(EmpheqUtil.splitOptions(opts, { left: 1, right: 1 }));
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
    EmpheqMO(parser, _name, c) {
        parser.Push(parser.create('token', 'mo', {}, c));
    },
    EmpheqDelim(parser, name) {
        const c = parser.GetDelimiter(name);
        parser.Push(parser.create('token', 'mo', { stretchy: true, symmetric: true }, c));
    },
};
new EnvironmentMap('empheq-env', ParseMethods.environment, {
    empheq: [EmpheqMethods.Empheq, 'empheq'],
});
new CommandMap('empheq-macros', {
    empheqlbrace: [EmpheqMethods.EmpheqMO, '{'],
    empheqrbrace: [EmpheqMethods.EmpheqMO, '}'],
    empheqlbrack: [EmpheqMethods.EmpheqMO, '['],
    empheqrbrack: [EmpheqMethods.EmpheqMO, ']'],
    empheqlangle: [EmpheqMethods.EmpheqMO, '\u27E8'],
    empheqrangle: [EmpheqMethods.EmpheqMO, '\u27E9'],
    empheqlparen: [EmpheqMethods.EmpheqMO, '('],
    empheqrparen: [EmpheqMethods.EmpheqMO, ')'],
    empheqlvert: [EmpheqMethods.EmpheqMO, '|'],
    empheqrvert: [EmpheqMethods.EmpheqMO, '|'],
    empheqlVert: [EmpheqMethods.EmpheqMO, '\u2016'],
    empheqrVert: [EmpheqMethods.EmpheqMO, '\u2016'],
    empheqlfloor: [EmpheqMethods.EmpheqMO, '\u230A'],
    empheqrfloor: [EmpheqMethods.EmpheqMO, '\u230B'],
    empheqlceil: [EmpheqMethods.EmpheqMO, '\u2308'],
    empheqrceil: [EmpheqMethods.EmpheqMO, '\u2309'],
    empheqbiglbrace: [EmpheqMethods.EmpheqMO, '{'],
    empheqbigrbrace: [EmpheqMethods.EmpheqMO, '}'],
    empheqbiglbrack: [EmpheqMethods.EmpheqMO, '['],
    empheqbigrbrack: [EmpheqMethods.EmpheqMO, ']'],
    empheqbiglangle: [EmpheqMethods.EmpheqMO, '\u27E8'],
    empheqbigrangle: [EmpheqMethods.EmpheqMO, '\u27E9'],
    empheqbiglparen: [EmpheqMethods.EmpheqMO, '('],
    empheqbigrparen: [EmpheqMethods.EmpheqMO, ')'],
    empheqbiglvert: [EmpheqMethods.EmpheqMO, '|'],
    empheqbigrvert: [EmpheqMethods.EmpheqMO, '|'],
    empheqbiglVert: [EmpheqMethods.EmpheqMO, '\u2016'],
    empheqbigrVert: [EmpheqMethods.EmpheqMO, '\u2016'],
    empheqbiglfloor: [EmpheqMethods.EmpheqMO, '\u230A'],
    empheqbigrfloor: [EmpheqMethods.EmpheqMO, '\u230B'],
    empheqbiglceil: [EmpheqMethods.EmpheqMO, '\u2308'],
    empheqbigrceil: [EmpheqMethods.EmpheqMO, '\u2309'],
    empheql: EmpheqMethods.EmpheqDelim,
    empheqr: EmpheqMethods.EmpheqDelim,
    empheqbigl: EmpheqMethods.EmpheqDelim,
    empheqbigr: EmpheqMethods.EmpheqDelim,
});
export const EmpheqConfiguration = Configuration.create('empheq', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['empheq-macros'],
        [HandlerType.ENVIRONMENT]: ['empheq-env'],
    },
});
//# sourceMappingURL=EmpheqConfiguration.js.map