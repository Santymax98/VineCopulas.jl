"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConfiguration = exports.BaseTags = void 0;
exports.Other = Other;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var MapHandler_js_1 = require("../MapHandler.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var TokenMap_js_1 = require("../TokenMap.js");
var bitem = __importStar(require("./BaseItems.js"));
var Tags_js_1 = require("../Tags.js");
require("./BaseMappings.js");
var OperatorDictionary_js_1 = require("../../../core/MmlTree/OperatorDictionary.js");
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
var TexConstants_js_1 = require("../TexConstants.js");
var context_js_1 = require("../../../util/context.js");
var MATHVARIANT = TexConstants_js_1.TexConstant.Variant;
new TokenMap_js_1.CharacterMap('remap', null, {
    '-': '\u2212',
    '*': '\u2217',
    '`': '\u2018',
});
function Other(parser, char) {
    var font = parser.stack.env['font'];
    var ifont = parser.stack.env['italicFont'];
    var def = font ? { mathvariant: font } : {};
    var remap = MapHandler_js_1.MapHandler.getMap('remap').lookup(char);
    var range = (0, OperatorDictionary_js_1.getRange)(char);
    var type = range[3];
    var mo = parser.create('token', type, def, remap ? remap.char : char);
    var style = ParseUtil_js_1.ParseUtil.isLatinOrGreekChar(char)
        ? parser.configuration.mathStyle(char, true) || ifont
        : '';
    var variant = range[4] || (font && style === MATHVARIANT.NORMAL ? '' : style);
    if (variant) {
        mo.attributes.set('mathvariant', variant);
    }
    if (type === 'mo') {
        NodeUtil_js_1.default.setProperty(mo, 'fixStretchy', true);
        parser.configuration.addNode('fixStretchy', mo);
    }
    parser.Push(mo);
}
function csUndefined(_parser, name) {
    throw new TexError_js_1.default('UndefinedControlSequence', 'Undefined control sequence %1', '\\' + name);
}
function envUndefined(_parser, env) {
    throw new TexError_js_1.default('UnknownEnv', "Unknown environment '%1'", env);
}
function filterNonscript(_a) {
    var e_1, _b;
    var data = _a.data;
    try {
        for (var _c = __values(data.getList('nonscript')), _d = _c.next(); !_d.done; _d = _c.next()) {
            var mml = _d.value;
            if (mml.attributes.get('scriptlevel') > 0) {
                var parent_1 = mml.parent;
                parent_1.childNodes.splice(parent_1.childIndex(mml), 1);
                data.removeFromList(mml.kind, [mml]);
                if (mml.isKind('mrow')) {
                    var mstyle = mml.childNodes[0];
                    data.removeFromList('mstyle', [mstyle]);
                    data.removeFromList('mspace', mstyle.childNodes[0].childNodes);
                }
            }
            else if (mml.isKind('mrow')) {
                mml.parent.replaceChild(mml.childNodes[0], mml);
                data.removeFromList('mrow', [mml]);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
var BaseTags = (function (_super) {
    __extends(BaseTags, _super);
    function BaseTags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BaseTags;
}(Tags_js_1.AbstractTags));
exports.BaseTags = BaseTags;
exports.BaseConfiguration = Configuration_js_1.Configuration.create('base', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = function (config, jax) {
        var options = jax.parseOptions.options;
        if (options.digits) {
            options.numberPattern = options.digits;
        }
        new TokenMap_js_1.RegExpMap('digit', ParseMethods_js_1.default.digit, options.initialDigit);
        new TokenMap_js_1.RegExpMap('letter', ParseMethods_js_1.default.variable, options.initialLetter);
        var handler = config.handlers.get(HandlerTypes_js_1.HandlerType.CHARACTER);
        handler.add(['letter', 'digit'], null, 4);
    },
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['command', 'special'],
        _b[HandlerTypes_js_1.HandlerType.DELIMITER] = ['delimiter'],
        _b[HandlerTypes_js_1.HandlerType.MACRO] = [
            'delimiter',
            'macros',
            'lcGreek',
            'ucGreek',
            'mathchar0mi',
            'mathchar0mo',
            'mathchar7',
        ],
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['environment'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.FALLBACK] = (_c = {},
        _c[HandlerTypes_js_1.HandlerType.CHARACTER] = Other,
        _c[HandlerTypes_js_1.HandlerType.MACRO] = csUndefined,
        _c[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = envUndefined,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_d = {},
        _d[bitem.StartItem.prototype.kind] = bitem.StartItem,
        _d[bitem.StopItem.prototype.kind] = bitem.StopItem,
        _d[bitem.OpenItem.prototype.kind] = bitem.OpenItem,
        _d[bitem.CloseItem.prototype.kind] = bitem.CloseItem,
        _d[bitem.NullItem.prototype.kind] = bitem.NullItem,
        _d[bitem.PrimeItem.prototype.kind] = bitem.PrimeItem,
        _d[bitem.SubsupItem.prototype.kind] = bitem.SubsupItem,
        _d[bitem.OverItem.prototype.kind] = bitem.OverItem,
        _d[bitem.LeftItem.prototype.kind] = bitem.LeftItem,
        _d[bitem.Middle.prototype.kind] = bitem.Middle,
        _d[bitem.RightItem.prototype.kind] = bitem.RightItem,
        _d[bitem.BreakItem.prototype.kind] = bitem.BreakItem,
        _d[bitem.BeginItem.prototype.kind] = bitem.BeginItem,
        _d[bitem.EndItem.prototype.kind] = bitem.EndItem,
        _d[bitem.StyleItem.prototype.kind] = bitem.StyleItem,
        _d[bitem.PositionItem.prototype.kind] = bitem.PositionItem,
        _d[bitem.CellItem.prototype.kind] = bitem.CellItem,
        _d[bitem.MmlItem.prototype.kind] = bitem.MmlItem,
        _d[bitem.FnItem.prototype.kind] = bitem.FnItem,
        _d[bitem.NotItem.prototype.kind] = bitem.NotItem,
        _d[bitem.NonscriptItem.prototype.kind] = bitem.NonscriptItem,
        _d[bitem.DotsItem.prototype.kind] = bitem.DotsItem,
        _d[bitem.ArrayItem.prototype.kind] = bitem.ArrayItem,
        _d[bitem.EqnArrayItem.prototype.kind] = bitem.EqnArrayItem,
        _d[bitem.EquationItem.prototype.kind] = bitem.EquationItem,
        _d[bitem.MstyleItem.prototype.kind] = bitem.MstyleItem,
        _d),
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        maxMacros: 1000,
        digits: '',
        numberPattern: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
        initialDigit: /[0-9.,]/,
        identifierPattern: /^[a-zA-Z]+/,
        initialLetter: /[a-zA-Z]/,
        baseURL: !context_js_1.context.document ||
            context_js_1.context.document.getElementsByTagName('base').length === 0
            ? ''
            : String(context_js_1.context.document.location).replace(/#.*$/, ''),
    },
    _a[HandlerTypes_js_1.ConfigurationType.TAGS] = {
        base: BaseTags,
    },
    _a[HandlerTypes_js_1.ConfigurationType.POSTPROCESSORS] = [[filterNonscript, -4]],
    _a));
//# sourceMappingURL=BaseConfiguration.js.map