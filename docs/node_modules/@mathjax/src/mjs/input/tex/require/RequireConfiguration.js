import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration, ConfigurationHandler, } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
import { MathJax } from '../../../components/startup.js';
import { Package } from '../../../components/package.js';
import { Loader, CONFIG as LOADERCONFIG } from '../../../components/loader.js';
import { mathjax } from '../../../mathjax.js';
import { expandable } from '../../../util/Options.js';
const MJCONFIG = MathJax.config;
function RegisterExtension(jax, name) {
    const require = jax.parseOptions.options.require;
    const required = jax.parseOptions.packageData.get('require')
        .required;
    const extension = name.substring(require.prefix.length);
    if (!required.includes(extension)) {
        required.push(extension);
        const retry = RegisterDependencies(jax, LOADERCONFIG.dependencies[name]);
        if (retry) {
            mathjax.retryAfter(retry.then(() => ProcessExtension(jax, name, extension)));
        }
        else {
            ProcessExtension(jax, name, extension);
        }
    }
}
function ProcessExtension(jax, name, extension) {
    const handler = ConfigurationHandler.get(extension);
    if (handler) {
        let options = MJCONFIG[name] || {};
        if (handler.options &&
            Object.keys(handler.options).length === 1 &&
            handler.options[extension]) {
            options = { [extension]: options };
        }
        jax.configuration.add(extension, jax, options);
        const configured = jax.parseOptions.packageData.get('require').configured;
        if (handler.preprocessors.length && !configured.has(extension)) {
            configured.set(extension, true);
            mathjax.retryAfter(Promise.resolve());
        }
    }
}
function RegisterDependencies(jax, names = []) {
    const prefix = jax.parseOptions.options.require.prefix;
    const retries = [];
    for (const name of names) {
        if (name.substring(0, prefix.length) === prefix) {
            try {
                RegisterExtension(jax, name);
            }
            catch (err) {
                if (!err.retry)
                    throw err;
                retries.push(err.retry);
            }
        }
    }
    return retries.length ? Promise.all(retries) : null;
}
export function RequireLoad(parser, name) {
    var _a, _b;
    const options = parser.options.require;
    const allow = options.allow;
    const extension = (name.substring(0, 1) === '[' ? '' : options.prefix) + name;
    const allowed = Object.hasOwn(allow, extension)
        ? allow[extension]
        : Object.hasOwn(allow, name)
            ? allow[name]
            : options.defaultAllow;
    if (!allowed) {
        throw new TexError('BadRequire', 'Extension "%1" is not allowed to be loaded', extension);
    }
    const data = Package.packages.get(extension);
    if (!data) {
        mathjax.retryAfter(Loader.load(extension).catch((_) => { }));
    }
    if (data.hasFailed) {
        throw new TexError('RequireFail', 'Extension "%1" failed to load', name);
    }
    const require = (_a = LOADERCONFIG[extension]) === null || _a === void 0 ? void 0 : _a.rendererExtensions;
    const menu = (_b = MathJax.startup.document) === null || _b === void 0 ? void 0 : _b.menu;
    if (require && menu) {
        menu.addRequiredExtensions(require);
    }
    RegisterExtension(parser.configuration.packageData.get('require').jax, extension);
}
function config(_config, jax) {
    jax.parseOptions.packageData.set('require', {
        jax: jax,
        required: [...jax.options.packages],
        configured: new Map()
    });
    const options = jax.parseOptions.options.require;
    const prefix = options.prefix;
    if (prefix.match(/[^_a-zA-Z0-9]/)) {
        throw Error('Illegal characters used in \\require prefix');
    }
    if (!LOADERCONFIG.paths[prefix]) {
        LOADERCONFIG.paths[prefix] = '[mathjax]/input/tex/extensions';
    }
    options.prefix = '[' + prefix + ']/';
}
export const RequireMethods = {
    Require(parser, name) {
        const required = parser.GetArgument(name);
        if (required.match(/[^_a-zA-Z0-9]/) || required === '') {
            throw new TexError('BadPackageName', 'Argument for %1 is not a valid package name', name);
        }
        RequireLoad(parser, required);
        parser.Push(parser.itemFactory.create('null'));
    },
};
export const options = {
    require: {
        allow: expandable({
            base: false,
            autoload: false,
            configmacros: false,
            tagformat: false,
            setoptions: false,
            texhtml: false,
        }),
        defaultAllow: true,
        prefix: 'tex',
    },
};
new CommandMap('require', { require: RequireMethods.Require });
export const RequireConfiguration = Configuration.create('require', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['require'],
    },
    [ConfigurationType.CONFIG]: config,
    [ConfigurationType.OPTIONS]: options,
});
//# sourceMappingURL=RequireConfiguration.js.map