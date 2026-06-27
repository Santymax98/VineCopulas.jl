import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration, ConfigurationHandler, } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
import { ParseUtil } from '../ParseUtil.js';
import { Macro } from '../Token.js';
import BaseMethods from '../base/BaseMethods.js';
import { expandable, isObject } from '../../../util/Options.js';
import { PrioritizedList } from '../../../util/PrioritizedList.js';
export const SetOptionsUtil = {
    filterPackage(parser, extension) {
        if (extension !== 'tex' && !ConfigurationHandler.get(extension)) {
            throw new TexError('NotAPackage', 'Not a defined package: %1', extension);
        }
        const config = parser.options.setoptions;
        const options = config.allowOptions[extension];
        if ((options === undefined && !config.allowPackageDefault) ||
            options === false) {
            throw new TexError('PackageNotSettable', 'Options can\'t be set for package "%1"', extension);
        }
        return true;
    },
    filterOption(parser, extension, option) {
        const config = parser.options.setoptions;
        const options = config.allowOptions[extension] || {};
        const isTex = extension === 'tex';
        const allow = Object.hasOwn(options, option) && !isObject(options[option])
            ? options[option]
            : null;
        if (allow === false || (allow === null && !config.allowOptionsDefault)) {
            if (isTex) {
                throw new TexError('TeXOptionNotSettable', 'Option "%1" is not allowed to be set', option);
            }
            else {
                throw new TexError('OptionNotSettable', 'Option "%1" is not allowed to be set for package %2', option, extension);
            }
        }
        const extOptions = isTex ? parser.options : parser.options[extension];
        if (!extOptions || !Object.hasOwn(extOptions, option)) {
            if (isTex) {
                throw new TexError('InvalidTexOption', 'Invalid TeX option "%1"', option);
            }
            else {
                throw new TexError('InvalidOptionKey', 'Invalid option "%1" for package "%2"', option, extension);
            }
        }
        return true;
    },
    filterValue(_parser, _extension, _option, value) {
        if (typeof value !== 'string') {
            return value;
        }
        const match = value.match(/^\/(.*)\/([dgimsuvy]*)$/);
        return match ? new RegExp(match[1], match[2]) : value;
    },
};
function SetOptions(parser, name) {
    const extension = parser.GetBrackets(name) || 'tex';
    const options = ParseUtil.keyvalOptions(parser.GetArgument(name));
    const config = parser.options.setoptions;
    if (!config.filterPackage(parser, extension))
        return;
    for (const key of Object.keys(options)) {
        if (config.filterOption(parser, extension, key)) {
            (extension === 'tex' ? parser.options : parser.options[extension])[key] =
                config.filterValue(parser, extension, key, options[key]);
        }
    }
    parser.Push(parser.itemFactory.create('null'));
}
function setoptionsConfig(_config, jax) {
    const setOptionsMap = new CommandMap('setoptions', {
        setOptions: SetOptions,
    });
    const macros = jax.parseOptions.handlers.get(HandlerType.MACRO);
    macros.add(['setoptions'], null, PrioritizedList.DEFAULTPRIORITY - 1);
    const require = macros.lookup('require');
    if (require) {
        setOptionsMap.add('Require', new Macro('Require', require._func));
        setOptionsMap.add('require', new Macro('require', BaseMethods.Macro, [
            '\\Require{#2}\\setOptions[#2]{#1}',
            2,
            '',
        ]));
    }
}
export const SetOptionsConfiguration = Configuration.create('setoptions', {
    [ConfigurationType.CONFIG]: setoptionsConfig,
    [ConfigurationType.PRIORITY]: 3,
    [ConfigurationType.OPTIONS]: {
        setoptions: {
            filterPackage: SetOptionsUtil.filterPackage,
            filterOption: SetOptionsUtil.filterOption,
            filterValue: SetOptionsUtil.filterValue,
            allowPackageDefault: true,
            allowOptionsDefault: true,
            allowOptions: expandable({
                tex: {
                    FindTeX: false,
                    formatError: false,
                    package: false,
                    baseURL: false,
                    tags: false,
                    maxBuffer: false,
                    maxMaxros: false,
                    macros: false,
                    environments: false
                },
                setoptions: false,
                autoload: false,
                require: false,
                configmacros: false,
                tagformat: false
            })
        }
    },
});
//# sourceMappingURL=SetOptionsConfiguration.js.map