import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import BaseMethods from '../base/BaseMethods.js';
function ChooseFont(parser, name) {
    BaseMethods.MathFont(parser, name, parser.options.dsfont.sans ? '-ds-ss' : '-ds-rm');
}
new CommandMap('dsfont', {
    mathds: ChooseFont,
});
export const DsfontConfiguration = Configuration.create('dsfont', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['dsfont'],
    },
    [ConfigurationType.OPTIONS]: {
        dsfont: {
            sans: false,
        },
    },
});
//# sourceMappingURL=DsfontConfiguration.js.map