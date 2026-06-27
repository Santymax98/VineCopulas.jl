import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { CommandMap } from '../TokenMap.js';
import { Configuration } from '../Configuration.js';
const ColorV2Methods = {
    Color(parser, name) {
        const color = parser.GetArgument(name);
        const old = parser.stack.env['color'];
        parser.stack.env['color'] = color;
        const math = parser.ParseArg(name);
        if (old) {
            parser.stack.env['color'] = old;
        }
        else {
            delete parser.stack.env['color'];
        }
        const node = parser.create('node', 'mstyle', [math], { mathcolor: color });
        parser.Push(node);
    },
};
new CommandMap('colorv2', { color: ColorV2Methods.Color });
export const ColorConfiguration = Configuration.create('colorv2', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['colorv2'] },
});
//# sourceMappingURL=ColorV2Configuration.js.map