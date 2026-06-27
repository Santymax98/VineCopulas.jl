import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { CommandMap } from '../TokenMap.js';
export const UnitsMethods = {
    Unit(parser, name) {
        const val = parser.GetBrackets(name);
        const dim = parser.GetArgument(name);
        let macro = `\\mathrm{${dim}}`;
        if (val) {
            macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
        }
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
    },
    UnitFrac(parser, name) {
        const val = parser.GetBrackets(name);
        const num = parser.GetArgument(name);
        const den = parser.GetArgument(name);
        let macro = `\\nicefrac[\\mathrm]{${num}}{${den}}`;
        if (val) {
            macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
        }
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
    },
    NiceFrac(parser, name) {
        const font = parser.GetBrackets(name, '\\mathrm');
        const num = parser.GetArgument(name);
        const den = parser.GetArgument(name);
        const numMml = new TexParser(`${font}{${num}}`, Object.assign({}, parser.stack.env), parser.configuration).mml();
        const denMml = new TexParser(`${font}{${den}}`, Object.assign({}, parser.stack.env), parser.configuration).mml();
        const def = parser.options.units.ugly ? {} : { bevelled: true };
        const node = parser.create('node', 'mfrac', [numMml, denMml], def);
        parser.Push(node);
    },
};
new CommandMap('units', {
    units: UnitsMethods.Unit,
    unitfrac: UnitsMethods.UnitFrac,
    nicefrac: UnitsMethods.NiceFrac,
});
export const UnitsConfiguration = Configuration.create('units', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['units'] },
    [ConfigurationType.OPTIONS]: {
        units: {
            loose: false,
            ugly: false,
        },
    },
});
//# sourceMappingURL=UnitsConfiguration.js.map