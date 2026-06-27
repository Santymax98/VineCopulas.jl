import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import { AmsMethods } from '../ams/AmsMethods.js';
import { NewcommandUtil } from '../newcommand/NewcommandUtil.js';
import { NewcommandConfig } from '../newcommand/NewcommandConfiguration.js';
import TexError from '../TexError.js';
const ExtpfeilMethods = {
    NewExtArrow(parser, name) {
        let cs = parser.GetArgument(name);
        const space = parser.GetArgument(name);
        const chr = parser.GetArgument(name);
        if (!cs.match(/^\\([a-z]+|.)$/i)) {
            throw new TexError('NewextarrowArg1', 'First argument to %1 must be a control sequence name', name);
        }
        if (!space.match(/^(\d+),(\d+)$/)) {
            throw new TexError('NewextarrowArg2', 'Second argument to %1 must be two integers separated by a comma', name);
        }
        if (!chr.match(/^(\d+|0x[0-9A-F]+)$/i)) {
            throw new TexError('NewextarrowArg3', 'Third argument to %1 must be a unicode character number', name);
        }
        cs = cs.substring(1);
        const spaces = space.split(',');
        NewcommandUtil.addMacro(parser, cs, ExtpfeilMethods.xArrow, [
            parseInt(chr),
            parseInt(spaces[0]),
            parseInt(spaces[1]),
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    xArrow: AmsMethods.xArrow,
};
new CommandMap('extpfeil', {
    xtwoheadrightarrow: [ExtpfeilMethods.xArrow, 0x21a0, 12, 16],
    xtwoheadleftarrow: [ExtpfeilMethods.xArrow, 0x219e, 17, 13],
    xmapsto: [ExtpfeilMethods.xArrow, 0x21a6, 6, 7],
    xlongequal: [ExtpfeilMethods.xArrow, 0x003d, 7, 7],
    xtofrom: [ExtpfeilMethods.xArrow, 0x21c4, 12, 12],
    Newextarrow: ExtpfeilMethods.NewExtArrow,
});
export const ExtpfeilConfiguration = Configuration.create('extpfeil', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['extpfeil'] },
    [ConfigurationType.CONFIG]: NewcommandConfig,
});
//# sourceMappingURL=ExtpfeilConfiguration.js.map