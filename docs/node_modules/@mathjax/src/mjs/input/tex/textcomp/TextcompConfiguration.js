import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import './TextcompMappings.js';
Configuration.create('text-textcomp', {
    [ConfigurationType.PARSER]: 'text',
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['textcomp-macros'] },
});
export const TextcompConfiguration = Configuration.create('textcomp', {
    [ConfigurationType.HANDLER]: { macro: ['textcomp-macros'] },
    config(_config, jax) {
        const textmacros = jax.parseOptions.packageData.get('textmacros');
        if (textmacros) {
            textmacros.parseOptions.options.textmacros.packages.push('text-textcomp');
            textmacros.textConf.add('text-textcomp', jax, {});
        }
    },
});
//# sourceMappingURL=TextcompConfiguration.js.map