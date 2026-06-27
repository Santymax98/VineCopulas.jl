import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import './BboldxMappings.js';
Configuration.create('text-bboldx', {
    parser: 'text',
    handler: {
        macro: [
            'text-bboldx',
            'text-bboldx-mathchar0miNormal',
            'text-bboldx-delimiterNormal',
            'text-bboldx-mathchar0miBold',
            'text-bboldx-delimiterBold',
        ],
    },
});
export const BboldxConfiguration = Configuration.create('bboldx', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: [
            'bboldx',
            'bboldx-mathchar0miNormal',
            'bboldx-delimiterNormal',
            'bboldx-mathchar0miBold',
            'bboldx-delimiterBold',
        ],
    },
    [ConfigurationType.OPTIONS]: {
        bboldx: {
            bfbb: false,
            light: false,
        },
    },
    config(_config, jax) {
        const textmacros = jax.parseOptions.packageData.get('textmacros');
        if (textmacros) {
            textmacros.parseOptions.options.textmacros.packages.push('text-bboldx');
            textmacros.textConf.add('text-bboldx', jax, {});
        }
    },
    priority: 3,
});
//# sourceMappingURL=BboldxConfiguration.js.map