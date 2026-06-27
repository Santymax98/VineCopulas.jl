import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration, ParserConfiguration } from '../Configuration.js';
import ParseOptions from '../ParseOptions.js';
import { TagsFactory } from '../Tags.js';
import { StartItem, StopItem, MmlItem, StyleItem } from '../base/BaseItems.js';
import { TextParser } from './TextParser.js';
import { TextMacrosMethods } from './TextMacrosMethods.js';
import './TextMacrosMappings.js';
export const TextBaseConfiguration = Configuration.create('text-base', {
    [ConfigurationType.PARSER]: 'text',
    [ConfigurationType.PRIORITY]: 1,
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['command', 'text-special'],
        [HandlerType.MACRO]: ['text-macros'],
    },
    [ConfigurationType.FALLBACK]: {
        [HandlerType.CHARACTER]: (parser, c) => {
            parser.text += c;
        },
        [HandlerType.MACRO]: (parser, name) => {
            const texParser = parser.texParser;
            const macro = texParser.lookup(HandlerType.MACRO, name);
            if (macro && macro._func !== TextMacrosMethods.Macro) {
                parser.Error('MathMacro', '%1 is only supported in math mode', '\\' + name);
            }
            texParser.parse(HandlerType.MACRO, [parser, name]);
        },
    },
    [ConfigurationType.ITEMS]: {
        [StartItem.prototype.kind]: StartItem,
        [StopItem.prototype.kind]: StopItem,
        [MmlItem.prototype.kind]: MmlItem,
        [StyleItem.prototype.kind]: StyleItem,
    },
});
function internalMath(parser, text, level, mathvariant) {
    const config = parser.configuration.packageData.get('textmacros');
    if (!(parser instanceof TextParser)) {
        config.texParser = parser;
    }
    config.parseOptions.clear();
    return [
        new TextParser(text, mathvariant ? { mathvariant } : {}, config.parseOptions, level).mml(),
    ];
}
export const TextMacrosConfiguration = Configuration.create('textmacros', {
    [ConfigurationType.PRIORITY]: 1,
    [ConfigurationType.CONFIG]: (_config, jax) => {
        const textConf = new ParserConfiguration(jax.parseOptions.options.textmacros.packages, ['tex', 'text']);
        textConf.init();
        const parseOptions = new ParseOptions(textConf, []);
        parseOptions.options = jax.parseOptions.options;
        textConf.config(jax);
        TagsFactory.addTags(textConf.tags);
        parseOptions.tags = TagsFactory.getDefault();
        parseOptions.tags.configuration = parseOptions;
        parseOptions.packageData = jax.parseOptions.packageData;
        parseOptions.packageData.set('textmacros', {
            textConf,
            parseOptions,
            jax,
            texParser: null,
        });
        parseOptions.options.internalMath = internalMath;
    },
    [ConfigurationType.PREPROCESSORS]: [
        (data) => {
            const config = data.data.packageData.get('textmacros');
            config.parseOptions.nodeFactory.setMmlFactory(config.jax.mmlFactory);
        },
    ],
    [ConfigurationType.OPTIONS]: {
        textmacros: {
            packages: ['text-base'],
        },
    },
});
//# sourceMappingURL=TextMacrosConfiguration.js.map