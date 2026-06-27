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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesConfiguration = exports.CasesMethods = exports.CasesTags = exports.CasesBeginItem = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
var TexError_js_1 = __importDefault(require("../TexError.js"));
var BaseItems_js_1 = require("../base/BaseItems.js");
var AmsConfiguration_js_1 = require("../ams/AmsConfiguration.js");
var EmpheqUtil_js_1 = require("../empheq/EmpheqUtil.js");
var CasesBeginItem = (function (_super) {
    __extends(CasesBeginItem, _super);
    function CasesBeginItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(CasesBeginItem.prototype, "kind", {
        get: function () {
            return 'cases-begin';
        },
        enumerable: false,
        configurable: true
    });
    CasesBeginItem.prototype.checkItem = function (item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            if (this.getProperty('end')) {
                this.setProperty('end', false);
                return [[], true];
            }
        }
        return _super.prototype.checkItem.call(this, item);
    };
    return CasesBeginItem;
}(BaseItems_js_1.BeginItem));
exports.CasesBeginItem = CasesBeginItem;
var CasesTags = (function (_super) {
    __extends(CasesTags, _super);
    function CasesTags() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.subcounter = 0;
        return _this;
    }
    CasesTags.prototype.start = function (env, taggable, defaultTags) {
        this.subcounter = 0;
        _super.prototype.start.call(this, env, taggable, defaultTags);
    };
    CasesTags.prototype.autoTag = function () {
        if (this.currentTag.tag != null)
            return;
        if (this.currentTag.env === 'subnumcases') {
            if (this.subcounter === 0) {
                this.counter++;
            }
            this.subcounter++;
            this.tag(this.formatNumber(this.counter, this.subcounter), false);
        }
        else {
            if (this.currentTag.env !== 'numcases-left') {
                this.counter++;
            }
            this.tag(this.formatNumber(this.counter), false);
        }
    };
    CasesTags.prototype.formatNumber = function (n, m) {
        if (m === void 0) { m = null; }
        return n.toString() + (m === null ? '' : String.fromCharCode(0x60 + m));
    };
    return CasesTags;
}(AmsConfiguration_js_1.AmsTags));
exports.CasesTags = CasesTags;
exports.CasesMethods = {
    NumCases: function (parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            var cases = parser.stack.Top();
            var table = cases.Last;
            var original = ParseUtil_js_1.ParseUtil.copyNode(table, parser);
            var left = cases.getProperty('left');
            EmpheqUtil_js_1.EmpheqUtil.left(table, original, left + '\\mmlToken{mo}{\\U{7B}}\\,', parser, 'numcases-left');
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            return null;
        }
        else {
            var left = parser.GetArgument('\\begin{' + begin.getName() + '}');
            begin.setProperty('left', left);
            var array = BaseMethods_js_1.default.EqnArray(parser, begin, true, true, 'll', 'tt');
            array.arraydef.displaystyle = false;
            array.arraydef.rowspacing = '.2em';
            array.setProperty('numCases', true);
            parser.Push(begin);
            return array;
        }
    },
    Entry: function (parser, name) {
        if (!parser.stack.Top().getProperty('numCases')) {
            return BaseMethods_js_1.default.Entry(parser, name);
        }
        parser.Push(parser.itemFactory
            .create('cell')
            .setProperties({ isEntry: true, name: name }));
        var tex = parser.string;
        var braces = 0;
        var i = parser.i;
        var m = tex.length;
        while (i < m) {
            var c = tex.charAt(i);
            if (c === '{') {
                braces++;
                i++;
            }
            else if (c === '}') {
                if (braces === 0) {
                    break;
                }
                else {
                    braces--;
                    i++;
                }
            }
            else if (c === '&' && braces === 0) {
                throw new TexError_js_1.default('ExtraCasesAlignTab', 'Extra alignment tab in text for numcase environment');
            }
            else if (c === '\\' && braces === 0) {
                var cs = (tex.slice(i + 1).match(/^[a-z]+|./i) || [])[0];
                if (cs === '\\' ||
                    cs === 'cr' ||
                    cs === 'end' ||
                    cs === 'label' ||
                    cs === undefined) {
                    break;
                }
                else {
                    i += cs.length;
                }
            }
            else {
                i++;
            }
        }
        var text = tex.substring(parser.i, i).replace(/^\s*/, '');
        parser.PushAll(ParseUtil_js_1.ParseUtil.internalMath(parser, text, 0));
        parser.i = i;
        return null;
    },
    environment: function (parser, env, func, args) {
        var item = parser.itemFactory
            .create('cases-begin')
            .setProperties({ name: env, end: true });
        parser.Push(func.apply(void 0, __spreadArray([parser, item], __read(args), false)));
    },
};
new TokenMap_js_1.EnvironmentMap('cases-env', exports.CasesMethods.environment, {
    numcases: [exports.CasesMethods.NumCases, 'cases'],
    subnumcases: [exports.CasesMethods.NumCases, 'cases'],
});
new TokenMap_js_1.MacroMap('cases-macros', {
    '&': exports.CasesMethods.Entry,
});
exports.CasesConfiguration = Configuration_js_1.Configuration.create('cases', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {},
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['cases-env'],
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['cases-macros'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_c = {},
        _c[CasesBeginItem.prototype.kind] = CasesBeginItem,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.TAGS] = { cases: CasesTags },
    _a));
//# sourceMappingURL=CasesConfiguration.js.map