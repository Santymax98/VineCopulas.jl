import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import { ParseUtil } from '../ParseUtil.js';
export const ENCLOSE_OPTIONS = {
    'data-arrowhead': 1,
    color: 1,
    mathcolor: 1,
    background: 1,
    mathbackground: 1,
    'data-padding': 1,
    'data-thickness': 1,
};
export const EncloseMethods = {
    Enclose(parser, name) {
        const notation = parser.GetArgument(name).replace(/,/g, ' ');
        const attr = parser.GetBrackets(name, '');
        const math = parser.ParseArg(name);
        const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
        def.notation = notation;
        parser.Push(parser.create('node', 'menclose', [math], def));
    },
};
new CommandMap('enclose', { enclose: EncloseMethods.Enclose });
export const EncloseConfiguration = Configuration.create('enclose', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['enclose'] },
});
//# sourceMappingURL=EncloseConfiguration.js.map