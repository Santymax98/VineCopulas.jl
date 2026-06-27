"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextMacrosConfiguration = exports.TextBaseConfiguration = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var ParseOptions_js_1 = __importDefault(require("../ParseOptions.js"));
var Tags_js_1 = require("../Tags.js");
var BaseItems_js_1 = require("../base/BaseItems.js");
var TextParser_js_1 = require("./TextParser.js");
var TextMacrosMethods_js_1 = require("./TextMacrosMethods.js");
require("./TextMacrosMappings.js");
exports.TextBaseConfiguration = Configuration_js_1.Configuration.create('text-base', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.PARSER] = 'text',
    _a[HandlerTypes_js_1.ConfigurationType.PRIORITY] = 1,
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['command', 'text-special'],
        _b[HandlerTypes_js_1.HandlerType.MACRO] = ['text-macros'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.FALLBACK] = (_c = {},
        _c[HandlerTypes_js_1.HandlerType.CHARACTER] = function (parser, c) {
            parser.text += c;
        },
        _c[HandlerTypes_js_1.HandlerType.MACRO] = function (parser, name) {
            var texParser = parser.texParser;
            var macro = texParser.lookup(HandlerTypes_js_1.HandlerType.MACRO, name);
            if (macro && macro._func !== TextMacrosMethods_js_1.TextMacrosMethods.Macro) {
                parser.Error('MathMacro', '%1 is only supported in math mode', '\\' + name);
            }
            texParser.parse(HandlerTypes_js_1.HandlerType.MACRO, [parser, name]);
        },
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_d = {},
        _d[BaseItems_js_1.StartItem.prototype.kind] = BaseItems_js_1.StartItem,
        _d[BaseItems_js_1.StopItem.prototype.kind] = BaseItems_js_1.StopItem,
        _d[BaseItems_js_1.MmlItem.prototype.kind] = BaseItems_js_1.MmlItem,
        _d[BaseItems_js_1.StyleItem.prototype.kind] = BaseItems_js_1.StyleItem,
        _d),
    _a));
function internalMath(parser, text, level, mathvariant) {
    var config = parser.configuration.packageData.get('textmacros');
    if (!(parser instanceof TextParser_js_1.TextParser)) {
        config.texParser = parser;
    }
    config.parseOptions.clear();
    return [
        new TextParser_js_1.TextParser(text, mathvariant ? { mathvariant: mathvariant } : {}, config.parseOptions, level).mml(),
    ];
}
exports.TextMacrosConfiguration = Configuration_js_1.Configuration.create('textmacros', (_e = {},
    _e[HandlerTypes_js_1.ConfigurationType.PRIORITY] = 1,
    _e[HandlerTypes_js_1.ConfigurationType.CONFIG] = function (_config, jax) {
        var textConf = new Configuration_js_1.ParserConfiguration(jax.parseOptions.options.textmacros.packages, ['tex', 'text']);
        textConf.init();
        var parseOptions = new ParseOptions_js_1.default(textConf, []);
        parseOptions.options = jax.parseOptions.options;
        textConf.config(jax);
        Tags_js_1.TagsFactory.addTags(textConf.tags);
        parseOptions.tags = Tags_js_1.TagsFactory.getDefault();
        parseOptions.tags.configuration = parseOptions;
        parseOptions.packageData = jax.parseOptions.packageData;
        parseOptions.packageData.set('textmacros', {
            textConf: textConf,
            parseOptions: parseOptions,
            jax: jax,
            texParser: null,
        });
        parseOptions.options.internalMath = internalMath;
    },
    _e[HandlerTypes_js_1.ConfigurationType.PREPROCESSORS] = [
        function (data) {
            var config = data.data.packageData.get('textmacros');
            config.parseOptions.nodeFactory.setMmlFactory(config.jax.mmlFactory);
        },
    ],
    _e[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        textmacros: {
            packages: ['text-base'],
        },
    },
    _e));
//# sourceMappingURL=TextMacrosConfiguration.js.map