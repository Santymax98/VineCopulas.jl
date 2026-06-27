import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import { Macro } from '../Token.js';
import { RequireLoad, RequireConfiguration, } from '../require/RequireConfiguration.js';
import { Package } from '../../../components/package.js';
import { expandable, defaultOptions } from '../../../util/Options.js';
function Autoload(parser, name, extension, isMacro) {
    if (Package.packages.has(parser.options.require.prefix + extension)) {
        const def = parser.options.autoload[extension];
        const [macros, envs] = def.length === 2 && Array.isArray(def[0]) ? def : [def, []];
        for (const macro of macros) {
            AutoloadMacros.remove(macro);
        }
        for (const env of envs) {
            AutoloadEnvironments.remove(env);
        }
        parser.string =
            (isMacro ? name + ' ' : '\\begin{' + name.slice(1) + '}') +
                parser.string.slice(parser.i);
        parser.i = 0;
    }
    RequireLoad(parser, extension);
}
function initAutoload(config) {
    if (!config.options.require) {
        defaultOptions(config.options, RequireConfiguration.options);
    }
}
function configAutoload(config, jax) {
    const parser = jax.parseOptions;
    const macros = parser.handlers.get(HandlerType.MACRO);
    const environments = parser.handlers.get(HandlerType.ENVIRONMENT);
    const autoload = parser.options.autoload;
    parser.packageData.set('autoload', { Autoload });
    for (const extension of Object.keys(autoload)) {
        const def = autoload[extension];
        const [macs, envs] = def.length === 2 && Array.isArray(def[0]) ? def : [def, []];
        for (const name of macs) {
            if (!macros.lookup(name) || name === 'color') {
                AutoloadMacros.add(name, new Macro(name, Autoload, [extension, true]));
            }
        }
        for (const name of envs) {
            if (!environments.lookup(name)) {
                AutoloadEnvironments.add(name, new Macro(name, Autoload, [extension, false]));
            }
        }
    }
    if (!parser.packageData.get('require')) {
        RequireConfiguration.config(config, jax);
    }
}
const AutoloadMacros = new CommandMap('autoload-macros', {});
const AutoloadEnvironments = new CommandMap('autoload-environments', {});
export const AutoloadConfiguration = Configuration.create('autoload', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['autoload-macros'],
        [HandlerType.ENVIRONMENT]: ['autoload-environments'],
    },
    [ConfigurationType.OPTIONS]: {
        autoload: expandable({
            action: ['toggle', 'mathtip', 'texttip'],
            amscd: [[], ['CD']],
            bbox: ['bbox'],
            boldsymbol: ['boldsymbol'],
            braket: [
                'bra',
                'ket',
                'braket',
                'set',
                'Bra',
                'Ket',
                'Braket',
                'Set',
                'ketbra',
                'Ketbra',
            ],
            bussproofs: [[], ['prooftree']],
            cancel: ['cancel', 'bcancel', 'xcancel', 'cancelto'],
            color: ['color', 'definecolor', 'textcolor', 'colorbox', 'fcolorbox'],
            enclose: ['enclose'],
            extpfeil: [
                'xtwoheadrightarrow',
                'xtwoheadleftarrow',
                'xmapsto',
                'xlongequal',
                'xtofrom',
                'Newextarrow',
            ],
            html: ['data', 'href', 'class', 'style', 'cssId'],
            mhchem: ['ce', 'pu'],
            newcommand: [
                'newcommand',
                'renewcommand',
                'newenvironment',
                'renewenvironment',
                'def',
                'let',
            ],
            unicode: ['unicode', 'U', 'char'],
            verb: ['verb'],
        }),
    },
    [ConfigurationType.CONFIG]: configAutoload,
    [ConfigurationType.INIT]: initAutoload,
    [ConfigurationType.PRIORITY]: 10,
});
//# sourceMappingURL=AutoloadConfiguration.js.map