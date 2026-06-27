import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { CommandMap } from '../TokenMap.js';
import { Configuration } from '../Configuration.js';
import { ColorMethods } from './ColorMethods.js';
import { ColorModel } from './ColorUtil.js';
new CommandMap('color', {
    color: ColorMethods.Color,
    textcolor: ColorMethods.TextColor,
    definecolor: ColorMethods.DefineColor,
    colorbox: ColorMethods.ColorBox,
    fcolorbox: ColorMethods.FColorBox,
});
const config = function (_config, jax) {
    jax.parseOptions.packageData.set('color', { model: new ColorModel() });
};
export const ColorConfiguration = Configuration.create('color', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['color'],
    },
    [ConfigurationType.OPTIONS]: {
        color: {
            padding: '5px',
            borderWidth: '2px',
        },
    },
    [ConfigurationType.CONFIG]: config,
});
//# sourceMappingURL=ColorConfiguration.js.map