import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import BaseMethods from '../base/BaseMethods.js';
export const BbmMethods = {
    ChooseFont(parser, name, regular, bold) {
        BaseMethods.MathFont(parser, name, parser.options.bbm.bold ? bold : regular);
    },
    ChangeBold(parser, name) {
        const font = parser.GetArgument(name);
        parser.options.bbm.bold = font === 'bold' ? true : false;
    },
    MathFont: BaseMethods.MathFont,
};
new CommandMap('bbm', {
    mathversion: BbmMethods.ChangeBold,
    mathbbm: [BbmMethods.ChooseFont, '-bbm-normal', '-bbm-bold'],
    mathbbmss: [BbmMethods.ChooseFont, '-bbm-sans-serif', '-bbm-sans-serif-bold'],
    mathbbmtt: [BbmMethods.MathFont, '-bbm-monospace'],
});
export const BbmConfiguration = Configuration.create('bbm', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['bbm'],
    },
    [ConfigurationType.OPTIONS]: {
        bbm: {
            bold: false,
        },
    },
});
//# sourceMappingURL=BbmConfiguration.js.map