import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
function noUndefined(parser, name) {
    const textNode = parser.create('text', '\\' + name);
    const options = parser.options.noundefined;
    const def = {};
    for (const id of ['color', 'background', 'size']) {
        if (options[id]) {
            def['math' + id] = options[id];
        }
    }
    parser.Push(parser.create('node', 'mtext', [], def, textNode));
}
export const NoUndefinedConfiguration = Configuration.create('noundefined', {
    [ConfigurationType.FALLBACK]: { [HandlerType.MACRO]: noUndefined },
    [ConfigurationType.OPTIONS]: {
        noundefined: {
            color: 'red',
            background: '',
            size: '',
        },
    },
    [ConfigurationType.PRIORITY]: 3,
});
//# sourceMappingURL=NoUndefinedConfiguration.js.map