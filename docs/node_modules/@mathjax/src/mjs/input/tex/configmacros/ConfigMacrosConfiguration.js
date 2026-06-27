import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { expandable } from '../../../util/Options.js';
import { CommandMap, EnvironmentMap, MacroMap } from '../TokenMap.js';
import ParseMethods from '../ParseMethods.js';
import { Macro } from '../Token.js';
import NewcommandMethods from '../newcommand/NewcommandMethods.js';
import { BeginEnvItem } from '../newcommand/NewcommandItems.js';
const MACROSMAP = 'configmacros-map';
const ACTIVEMAP = 'configmacros-active-map';
const ENVIRONMENTMAP = 'configmacros-env-map';
function configmacrosInit(config) {
    new MacroMap(ACTIVEMAP, {});
    new CommandMap(MACROSMAP, {});
    new EnvironmentMap(ENVIRONMENTMAP, ParseMethods.environment, {});
    config.append(Configuration.local({
        handler: {
            [HandlerType.CHARACTER]: [ACTIVEMAP],
            [HandlerType.MACRO]: [MACROSMAP],
            [HandlerType.ENVIRONMENT]: [ENVIRONMENTMAP],
        },
        priority: 3,
    }));
}
function configmacrosConfig(_config, jax) {
    configActives(jax);
    configMacros(jax);
    configEnvironments(jax);
}
function setMacros(name, map, jax) {
    const handler = jax.parseOptions.handlers.retrieve(map);
    const macros = jax.parseOptions.options[name];
    for (const cs of Object.keys(macros)) {
        const def = typeof macros[cs] === 'string' ? [macros[cs]] : macros[cs];
        const macro = Array.isArray(def[2])
            ? new Macro(cs, NewcommandMethods.MacroWithTemplate, def.slice(0, 2).concat(def[2]))
            : new Macro(cs, NewcommandMethods.Macro, def);
        handler.add(cs, macro);
    }
}
function configActives(jax) {
    setMacros('active', ACTIVEMAP, jax);
}
function configMacros(jax) {
    setMacros('macros', MACROSMAP, jax);
}
function configEnvironments(jax) {
    const handler = jax.parseOptions.handlers.retrieve(ENVIRONMENTMAP);
    const environments = jax.parseOptions.options.environments;
    for (const env of Object.keys(environments)) {
        handler.add(env, new Macro(env, NewcommandMethods.BeginEnv, [true].concat(environments[env])));
    }
}
export const ConfigMacrosConfiguration = Configuration.create('configmacros', {
    [ConfigurationType.INIT]: configmacrosInit,
    [ConfigurationType.CONFIG]: configmacrosConfig,
    [ConfigurationType.ITEMS]: {
        [BeginEnvItem.prototype.kind]: BeginEnvItem,
    },
    [ConfigurationType.OPTIONS]: {
        active: expandable({}),
        macros: expandable({}),
        environments: expandable({}),
    },
});
//# sourceMappingURL=ConfigMacrosConfiguration.js.map