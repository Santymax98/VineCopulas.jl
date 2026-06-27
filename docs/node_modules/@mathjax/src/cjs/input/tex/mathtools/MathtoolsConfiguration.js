"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathtoolsConfiguration = void 0;
exports.fixPrescripts = fixPrescripts;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var Configuration_js_1 = require("../Configuration.js");
var Token_js_1 = require("../Token.js");
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var Options_js_1 = require("../../../util/Options.js");
var NewcommandConfiguration_js_1 = require("../newcommand/NewcommandConfiguration.js");
var NewcommandUtil_js_1 = require("../newcommand/NewcommandUtil.js");
require("./MathtoolsMappings.js");
var MathtoolsMethods_js_1 = require("./MathtoolsMethods.js");
var MathtoolsTags_js_1 = require("./MathtoolsTags.js");
var MathtoolsItems_js_1 = require("./MathtoolsItems.js");
function configMathtools(config, jax) {
    var e_1, _a;
    (0, NewcommandConfiguration_js_1.NewcommandConfig)(config, jax);
    var parser = jax.parseOptions;
    var pairedDelims = parser.options.mathtools.pairedDelimiters;
    var handler = config.handlers.retrieve(NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND);
    try {
        for (var _b = __values(Object.entries(pairedDelims)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), cs = _d[0], args = _d[1];
            handler.add(cs, new Token_js_1.Macro(cs, MathtoolsMethods_js_1.MathtoolsMethods.PairedDelimiters, args));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (parser.options.mathtools.legacycolonsymbols) {
        config.handlers.add(MathtoolsMethods_js_1.LEGACYCONFIG, {}, MathtoolsMethods_js_1.LEGACYPRIORITY);
    }
    (0, MathtoolsTags_js_1.MathtoolsTagFormat)(config, jax);
}
function fixPrescripts(_a) {
    var e_2, _b, e_3, _c;
    var data = _a.data;
    try {
        for (var _d = __values(data.getList('mmultiscripts')), _e = _d.next(); !_e.done; _e = _d.next()) {
            var node = _e.value;
            if (!node.getProperty('fixPrescript'))
                continue;
            var childNodes = NodeUtil_js_1.default.getChildren(node);
            var n = 0;
            try {
                for (var _f = (e_3 = void 0, __values([1, 2])), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var i = _g.value;
                    if (!childNodes[i]) {
                        NodeUtil_js_1.default.setChild(node, i, data.nodeFactory.create('node', 'none'));
                        n++;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (n === 2) {
                childNodes.splice(1, 2);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
exports.MathtoolsConfiguration = Configuration_js_1.Configuration.create('mathtools', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {
            macro: ['mathtools-macros', 'mathtools-delimiters']
        },
        _b[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = ['mathtools-environments'],
        _b[HandlerTypes_js_1.HandlerType.DELIMITER] = ['mathtools-delimiters'],
        _b[HandlerTypes_js_1.HandlerType.CHARACTER] = ['mathtools-characters'],
        _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = (_c = {},
        _c[MathtoolsItems_js_1.MultlinedItem.prototype.kind] = MathtoolsItems_js_1.MultlinedItem,
        _c),
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = configMathtools,
    _a[HandlerTypes_js_1.ConfigurationType.POSTPROCESSORS] = [[fixPrescripts, -6]],
    _a[HandlerTypes_js_1.ConfigurationType.OPTIONS] = {
        mathtools: {
            'multlined-gap': '1em',
            'multlined-pos': 'c',
            'multlined-width': '',
            'firstline-afterskip': '',
            'lastline-preskip': '',
            'smallmatrix-align': 'c',
            'shortvdotsadjustabove': '.2em',
            'shortvdotsadjustbelow': '.2em',
            'centercolon': false,
            'centercolon-offset': '.04em',
            'thincolon-dx': '-.04em',
            'thincolon-dw': '-.08em',
            'use-unicode': false,
            'legacycolonsymbols': false,
            'prescript-sub-format': '',
            'prescript-sup-format': '',
            'prescript-arg-format': '',
            'allow-mathtoolsset': true,
            pairedDelimiters: (0, Options_js_1.expandable)({}),
            tagforms: (0, Options_js_1.expandable)({}),
        }
    },
    _a));
//# sourceMappingURL=MathtoolsConfiguration.js.map