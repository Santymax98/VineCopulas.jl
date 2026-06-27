import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { BeginEnvItem } from './NewcommandItems.js';
import { NewcommandTables, NewcommandPriority } from './NewcommandUtil.js';
import './NewcommandMappings.js';
import ParseMethods from '../ParseMethods.js';
import * as sm from '../TokenMap.js';
export function NewcommandConfig(_config, jax) {
    if (jax.parseOptions.packageData.has('newcommand')) {
        return;
    }
    jax.parseOptions.packageData.set('newcommand', {});
    new sm.DelimiterMap(NewcommandTables.NEW_DELIMITER, ParseMethods.delimiter, {});
    new sm.CommandMap(NewcommandTables.NEW_COMMAND, {});
    new sm.EnvironmentMap(NewcommandTables.NEW_ENVIRONMENT, ParseMethods.environment, {});
    jax.parseOptions.handlers.add({
        [HandlerType.CHARACTER]: [],
        [HandlerType.DELIMITER]: [NewcommandTables.NEW_DELIMITER],
        [HandlerType.MACRO]: [
            NewcommandTables.NEW_DELIMITER,
            NewcommandTables.NEW_COMMAND,
        ],
        [HandlerType.ENVIRONMENT]: [NewcommandTables.NEW_ENVIRONMENT],
    }, {}, NewcommandPriority);
}
export const NewcommandConfiguration = Configuration.create('newcommand', {
    [ConfigurationType.HANDLER]: {
        macro: ['Newcommand-macros'],
    },
    [ConfigurationType.ITEMS]: {
        [BeginEnvItem.prototype.kind]: BeginEnvItem,
    },
    [ConfigurationType.OPTIONS]: {
        maxMacros: 1000,
        protectedMacros: ['begingroupSandbox'],
    },
    [ConfigurationType.CONFIG]: NewcommandConfig,
});
//# sourceMappingURL=NewcommandConfiguration.js.map