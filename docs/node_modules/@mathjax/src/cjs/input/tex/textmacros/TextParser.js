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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextParser = void 0;
var TexParser_js_1 = __importDefault(require("../TexParser.js"));
var TexError_js_1 = __importDefault(require("../TexError.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var BaseItems_js_1 = require("../base/BaseItems.js");
var TextParser = (function (_super) {
    __extends(TextParser, _super);
    function TextParser(text, env, configuration, level) {
        var _this = _super.call(this, text, env, configuration) || this;
        _this.level = level;
        return _this;
    }
    Object.defineProperty(TextParser.prototype, "texParser", {
        get: function () {
            return this.configuration.packageData.get('textmacros').texParser;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextParser.prototype, "tags", {
        get: function () {
            return this.texParser.tags;
        },
        enumerable: false,
        configurable: true
    });
    TextParser.prototype.mml = function () {
        this.copyLists();
        this.configuration.popParser();
        return this.level != null
            ? this.create('node', 'mstyle', this.nodes, {
                displaystyle: false,
                scriptlevel: this.level,
            })
            : this.nodes.length === 1
                ? this.nodes[0]
                : this.create('node', 'mrow', this.nodes);
    };
    TextParser.prototype.copyLists = function () {
        var e_1, _a, e_2, _b;
        var parseOptions = this.texParser.configuration;
        try {
            for (var _c = __values(Object.entries(this.configuration.nodeLists)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), name_1 = _e[0], list = _e[1];
                try {
                    for (var list_1 = (e_2 = void 0, __values(list)), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                        var node = list_1_1.value;
                        parseOptions.addNode(name_1, node);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (list_1_1 && !list_1_1.done && (_b = list_1.return)) _b.call(list_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.configuration.nodeLists = {};
    };
    TextParser.prototype.Parse = function () {
        this.text = '';
        this.nodes = [];
        this.envStack = [];
        _super.prototype.Parse.call(this);
    };
    TextParser.prototype.saveText = function () {
        if (this.text) {
            var mathvariant = this.stack.env.mathvariant;
            var text = ParseUtil_js_1.ParseUtil.internalText(this, this.text, mathvariant ? { mathvariant: mathvariant } : {});
            this.text = '';
            this.Push(text);
        }
    };
    TextParser.prototype.Push = function (mml) {
        if (this.text) {
            this.saveText();
        }
        if (mml instanceof BaseItems_js_1.StopItem) {
            return _super.prototype.Push.call(this, mml);
        }
        if (mml instanceof BaseItems_js_1.StyleItem) {
            this.stack.env.mathcolor = this.stack.env.color;
            return;
        }
        if (mml instanceof MmlNode_js_1.AbstractMmlNode) {
            this.addAttributes(mml);
            this.nodes.push(mml);
        }
    };
    TextParser.prototype.PushMath = function (mml) {
        var e_3, _a;
        var env = this.stack.env;
        try {
            for (var _b = __values(['mathsize', 'mathcolor']), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_2 = _c.value;
                if (env[name_2] && !mml.attributes.hasExplicit(name_2)) {
                    if (!mml.isToken && !mml.isKind('mstyle')) {
                        mml = this.create('node', 'mstyle', [mml]);
                    }
                    NodeUtil_js_1.default.setAttribute(mml, name_2, env[name_2]);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (mml.isInferred) {
            mml = this.create('node', 'mrow', mml.childNodes);
        }
        if (!mml.isKind('TeXAtom')) {
            mml = this.create('node', 'TeXAtom', [mml]);
        }
        this.nodes.push(mml);
    };
    TextParser.prototype.addAttributes = function (mml) {
        var e_4, _a;
        var env = this.stack.env;
        if (!mml.isToken)
            return;
        try {
            for (var _b = __values(['mathsize', 'mathcolor', 'mathvariant']), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_3 = _c.value;
                if (env[name_3] && !mml.attributes.hasExplicit(name_3)) {
                    NodeUtil_js_1.default.setAttribute(mml, name_3, env[name_3]);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    TextParser.prototype.ParseTextArg = function (name, env) {
        var text = this.GetArgument(name);
        env = Object.assign(Object.assign({}, this.stack.env), env);
        return new TextParser(text, env, this.configuration).mml();
    };
    TextParser.prototype.ParseArg = function (name) {
        return new TextParser(this.GetArgument(name), this.stack.env, this.configuration).mml();
    };
    TextParser.prototype.Error = function (id, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        throw new (TexError_js_1.default.bind.apply(TexError_js_1.default, __spreadArray([void 0, id, message], __read(args), false)))();
    };
    return TextParser;
}(TexParser_js_1.default));
exports.TextParser = TextParser;
//# sourceMappingURL=TextParser.js.map