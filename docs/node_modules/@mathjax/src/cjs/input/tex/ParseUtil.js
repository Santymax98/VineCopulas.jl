"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseUtil = exports.KeyValueTypes = exports.KeyValueDef = void 0;
var MmlNode_js_1 = require("../../core/MmlTree/MmlNode.js");
var NodeUtil_js_1 = __importDefault(require("./NodeUtil.js"));
var TexParser_js_1 = __importDefault(require("./TexParser.js"));
var TexError_js_1 = __importDefault(require("./TexError.js"));
var Entities_js_1 = require("../../util/Entities.js");
var UnitUtil_js_1 = require("./UnitUtil.js");
var KeyValueDef = (function () {
    function KeyValueDef(name, verify, convert) {
        this.name = name;
        this.verify = verify;
        this.convert = convert;
    }
    KeyValueDef.oneof = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return new this('string', function (value) { return values.includes(value); }, function (value) { return value; });
    };
    return KeyValueDef;
}());
exports.KeyValueDef = KeyValueDef;
exports.KeyValueTypes = {
    boolean: new KeyValueDef('boolean', function (value) { return value === 'true' || value === 'false'; }, function (value) { return value === 'true'; }),
    number: new KeyValueDef('number', function (value) { return !!value.match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/); }, function (value) { return parseFloat(value); }),
    integer: new KeyValueDef('integer', function (value) { return !!value.match(/^[-+]?\d+$/); }, function (value) { return parseInt(value); }),
    string: new KeyValueDef('string', function (_value) { return true; }, function (value) { return value; }),
    dimen: new KeyValueDef('dimen', function (value) { return UnitUtil_js_1.UnitUtil.matchDimen(value)[0] !== null; }, function (value) { return value; }),
};
function readKeyval(text, l3keys) {
    var _a, _b;
    if (l3keys === void 0) { l3keys = false; }
    var options = {};
    var rest = text;
    var end, key, val;
    var dropBrace = true;
    while (rest) {
        _a = __read(readValue(rest, ['=', ','], l3keys, dropBrace), 3), key = _a[0], end = _a[1], rest = _a[2];
        dropBrace = false;
        if (end === '=') {
            _b = __read(readValue(rest, [','], l3keys), 3), val = _b[0], end = _b[1], rest = _b[2];
            val = val === 'false' || val === 'true' ? JSON.parse(val) : val;
            options[key] = val;
        }
        else if (key) {
            options[key] = true;
        }
    }
    return options;
}
function removeBraces(text, count) {
    if (count === 0) {
        return text
            .replace(/^\s+/, '')
            .replace(/([^\\\s]|^)((?:\\\\)*(?:\\\s)?)?\s+$/, '$1$2');
    }
    while (count > 0) {
        text = text.trim().slice(1, -1);
        count--;
    }
    return text;
}
function readValue(text, end, l3keys, dropBrace) {
    if (l3keys === void 0) { l3keys = false; }
    if (dropBrace === void 0) { dropBrace = false; }
    var length = text.length;
    var braces = 0;
    var value = '';
    var index = 0;
    var start = 0;
    var countBraces = true;
    while (index < length) {
        var c = text[index++];
        switch (c) {
            case '\\':
                value += c + (text[index++] || '');
                countBraces = false;
                continue;
            case ' ':
                break;
            case '{':
                if (countBraces) {
                    start++;
                }
                braces++;
                break;
            case '}':
                if (!braces) {
                    throw new TexError_js_1.default('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
                }
                braces--;
                countBraces = false;
                break;
            default:
                if (!braces && end.includes(c)) {
                    return [
                        removeBraces(value, l3keys ? Math.min(1, start) : start),
                        c,
                        text.slice(index),
                    ];
                }
                if (start > braces) {
                    start = braces;
                }
                countBraces = false;
        }
        value += c;
    }
    if (braces) {
        throw new TexError_js_1.default('ExtraOpenMissingClose', 'Extra open brace or missing close brace');
    }
    return dropBrace && start
        ? ['', '', removeBraces(value, 1)]
        : [
            removeBraces(value, l3keys ? Math.min(1, start) : start),
            '',
            text.slice(index),
        ];
}
exports.ParseUtil = {
    cols: function () {
        var W = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            W[_i] = arguments[_i];
        }
        return W.map(function (n) { return UnitUtil_js_1.UnitUtil.em(n); }).join(' ');
    },
    fenced: function (configuration, open, mml, close, big, color) {
        if (big === void 0) { big = ''; }
        if (color === void 0) { color = ''; }
        var nf = configuration.nodeFactory;
        var mrow = nf.create('node', 'mrow', [], {
            open: open,
            close: close,
            texClass: MmlNode_js_1.TEXCLASS.INNER,
        });
        var mo;
        if (big) {
            mo = new TexParser_js_1.default('\\' + big + 'l' + open, configuration.parser.stack.env, configuration).mml();
        }
        else {
            var openNode = nf.create('text', open);
            mo = nf.create('node', 'mo', [], {
                fence: true,
                stretchy: true,
                symmetric: true,
                texClass: MmlNode_js_1.TEXCLASS.OPEN,
            }, openNode);
        }
        NodeUtil_js_1.default.appendChildren(mrow, [mo, mml]);
        if (big) {
            mo = new TexParser_js_1.default('\\' + big + 'r' + close, configuration.parser.stack.env, configuration).mml();
        }
        else {
            var closeNode = nf.create('text', close);
            mo = nf.create('node', 'mo', [], {
                fence: true,
                stretchy: true,
                symmetric: true,
                texClass: MmlNode_js_1.TEXCLASS.CLOSE,
            }, closeNode);
        }
        if (color) {
            mo.attributes.set('mathcolor', color);
        }
        NodeUtil_js_1.default.appendChildren(mrow, [mo]);
        return mrow;
    },
    fixedFence: function (configuration, open, mml, close) {
        var mrow = configuration.nodeFactory.create('node', 'mrow', [], {
            open: open,
            close: close,
            texClass: MmlNode_js_1.TEXCLASS.ORD,
        });
        if (open) {
            NodeUtil_js_1.default.appendChildren(mrow, [
                exports.ParseUtil.mathPalette(configuration, open, 'l'),
            ]);
        }
        if (NodeUtil_js_1.default.isType(mml, 'mrow')) {
            NodeUtil_js_1.default.appendChildren(mrow, NodeUtil_js_1.default.getChildren(mml));
        }
        else {
            NodeUtil_js_1.default.appendChildren(mrow, [mml]);
        }
        if (close) {
            NodeUtil_js_1.default.appendChildren(mrow, [
                exports.ParseUtil.mathPalette(configuration, close, 'r'),
            ]);
        }
        return mrow;
    },
    mathPalette: function (configuration, fence, side) {
        if (fence === '{' || fence === '}') {
            fence = '\\' + fence;
        }
        var D = '{\\bigg' + side + ' ' + fence + '}';
        var T = '{\\big' + side + ' ' + fence + '}';
        return new TexParser_js_1.default('\\mathchoice' + D + T + T + T, {}, configuration).mml();
    },
    fixInitialMO: function (configuration, nodes) {
        for (var i = 0, m = nodes.length; i < m; i++) {
            var child = nodes[i];
            if (child &&
                !NodeUtil_js_1.default.isType(child, 'mspace') &&
                (!NodeUtil_js_1.default.isType(child, 'TeXAtom') ||
                    (NodeUtil_js_1.default.getChildren(child)[0] &&
                        NodeUtil_js_1.default.getChildren(NodeUtil_js_1.default.getChildren(child)[0]).length))) {
                if (NodeUtil_js_1.default.isEmbellished(child) ||
                    (NodeUtil_js_1.default.isType(child, 'TeXAtom') &&
                        NodeUtil_js_1.default.getTexClass(child) === MmlNode_js_1.TEXCLASS.REL)) {
                    var mi = configuration.nodeFactory.create('node', 'mi');
                    nodes.unshift(mi);
                }
                break;
            }
        }
    },
    internalMath: function (parser, text, level, font) {
        text = text.replace(/ +/g, ' ');
        if (parser.configuration.options.internalMath) {
            return parser.configuration.options.internalMath(parser, text, level, font);
        }
        var mathvariant = font || parser.stack.env.font;
        var def = mathvariant ? { mathvariant: mathvariant } : {};
        var mml = [], i = 0, k = 0, c, node, match = '', braces = 0;
        if (text.match(/\\?[${}\\]|\\\(|\\(?:eq)?ref\s*\{|\\U/)) {
            while (i < text.length) {
                c = text.charAt(i++);
                if (c === '$') {
                    if (match === '$' && braces === 0) {
                        node = parser.create('node', 'TeXAtom', [
                            new TexParser_js_1.default(text.slice(k, i - 1), {}, parser.configuration).mml(),
                        ]);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match === '') {
                        if (k < i - 1) {
                            mml.push(exports.ParseUtil.internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '$';
                        k = i;
                    }
                }
                else if (c === '{' && match !== '') {
                    braces++;
                }
                else if (c === '}') {
                    if (match === '}' && braces === 0) {
                        var atom = new TexParser_js_1.default(text.slice(k, i), {}, parser.configuration).mml();
                        node = parser.create('node', 'TeXAtom', [atom], def);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match !== '') {
                        if (braces) {
                            braces--;
                        }
                    }
                }
                else if (c === '\\') {
                    if (match === '' && text.substring(i).match(/^(eq)?ref\s*\{/)) {
                        var len = RegExp['$&'].length;
                        if (k < i - 1) {
                            mml.push(exports.ParseUtil.internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '}';
                        k = i - 1;
                        i += len;
                    }
                    else {
                        c = text.charAt(i++);
                        if (c === '(' && match === '') {
                            if (k < i - 2) {
                                mml.push(exports.ParseUtil.internalText(parser, text.slice(k, i - 2), def));
                            }
                            match = ')';
                            k = i;
                        }
                        else if (c === ')' && match === ')' && braces === 0) {
                            node = parser.create('node', 'TeXAtom', [
                                new TexParser_js_1.default(text.slice(k, i - 2), {}, parser.configuration).mml(),
                            ]);
                            mml.push(node);
                            match = '';
                            k = i;
                        }
                        else if (c.match(/[${}\\]/) && match === '') {
                            i--;
                            text = text.substring(0, i - 1) + text.substring(i);
                        }
                        else if (c === 'U') {
                            var arg = text
                                .substring(i)
                                .match(/^\s*(?:([0-9A-F])|\{\s*([0-9A-F]+)\s*\})/);
                            if (!arg) {
                                throw new TexError_js_1.default('BadRawUnicode', 'Argument to %1 must a hexadecimal number with 1 to 6 digits', '\\U');
                            }
                            var c_1 = String.fromCodePoint(parseInt(arg[1] || arg[2], 16));
                            text =
                                text.substring(0, i - 2) +
                                    c_1 +
                                    text.substring(i + arg[0].length);
                            i = i - 2 + c_1.length;
                        }
                    }
                }
            }
            if (match !== '') {
                throw new TexError_js_1.default('MathNotTerminated', 'Math mode is not properly terminated');
            }
        }
        if (k < text.length) {
            mml.push(exports.ParseUtil.internalText(parser, text.slice(k), def));
        }
        if (level != null) {
            mml = [
                parser.create('node', 'mstyle', mml, {
                    displaystyle: false,
                    scriptlevel: level,
                }),
            ];
        }
        else if (mml.length > 1) {
            mml = [parser.create('node', 'mrow', mml)];
        }
        return mml;
    },
    internalText: function (parser, text, def) {
        text = text
            .replace(/\n+/g, ' ')
            .replace(/^ +/, Entities_js_1.entities.nbsp)
            .replace(/ +$/, Entities_js_1.entities.nbsp);
        var textNode = parser.create('text', text);
        return parser.create('node', 'mtext', [], def, textNode);
    },
    underOver: function (parser, base, script, pos, stack) {
        exports.ParseUtil.checkMovableLimits(base);
        if (NodeUtil_js_1.default.isType(base, 'munderover') && NodeUtil_js_1.default.isEmbellished(base)) {
            NodeUtil_js_1.default.setProperties(NodeUtil_js_1.default.getCoreMO(base), {
                lspace: 0,
                rspace: 0,
            });
            var mo = parser.create('node', 'mo', [], { rspace: 0 });
            base = parser.create('node', 'mrow', [mo, base]);
        }
        var mml = parser.create('node', 'munderover', [base]);
        NodeUtil_js_1.default.setChild(mml, pos === 'over' ? mml.over : mml.under, script);
        var node = mml;
        if (stack) {
            node = parser.create('node', 'TeXAtom', [
                parser.create('node', 'mstyle', [mml], {
                    displaystyle: true,
                    scriptlevel: 0,
                }),
            ], {
                texClass: MmlNode_js_1.TEXCLASS.OP,
                movesupsub: true,
            });
        }
        NodeUtil_js_1.default.setProperty(node, 'subsupOK', true);
        return node;
    },
    checkMovableLimits: function (base) {
        var symbol = NodeUtil_js_1.default.isType(base, 'mo') ? NodeUtil_js_1.default.getForm(base) : null;
        if (NodeUtil_js_1.default.getProperty(base, 'movablelimits') ||
            (symbol && symbol[3] && symbol[3].movablelimits)) {
            NodeUtil_js_1.default.setProperties(base, { movablelimits: false });
        }
    },
    setArrayAlign: function (array, align, parser) {
        if (!parser) {
            align = UnitUtil_js_1.UnitUtil.trimSpaces(align || '');
        }
        if (align === 't') {
            array.arraydef.align = 'baseline 1';
        }
        else if (align === 'b') {
            array.arraydef.align = 'baseline -1';
        }
        else if (align === 'c') {
            array.arraydef.align = 'axis';
        }
        else if (align) {
            if (parser) {
                parser.string = "[".concat(align, "]") + parser.string.slice(parser.i);
                parser.i = 0;
            }
            else {
                array.arraydef.align = align;
            }
        }
        return array;
    },
    substituteArgs: function (parser, args, str) {
        var text = '';
        var newstring = '';
        var i = 0;
        while (i < str.length) {
            var c = str.charAt(i++);
            if (c === '\\') {
                text += c + str.charAt(i++);
            }
            else if (c === '#') {
                c = str.charAt(i++);
                if (c === '#') {
                    text += c;
                }
                else {
                    if (!c.match(/[1-9]/) || parseInt(c, 10) > args.length) {
                        throw new TexError_js_1.default('IllegalMacroParam', 'Illegal macro parameter reference');
                    }
                    newstring = exports.ParseUtil.addArgs(parser, exports.ParseUtil.addArgs(parser, newstring, text), args[parseInt(c, 10) - 1]);
                    text = '';
                }
            }
            else {
                text += c;
            }
        }
        return exports.ParseUtil.addArgs(parser, newstring, text);
    },
    addArgs: function (parser, s1, s2) {
        if (s2.match(/^[a-z]/i) && s1.match(/(^|[^\\])(\\\\)*\\[a-z]+$/i)) {
            s1 += ' ';
        }
        if (s1.length + s2.length > parser.configuration.options['maxBuffer']) {
            throw new TexError_js_1.default('MaxBufferSize', 'MathJax internal buffer size exceeded; is there a' +
                ' recursive macro call?');
        }
        return s1 + s2;
    },
    checkMaxMacros: function (parser, isMacro) {
        if (isMacro === void 0) { isMacro = true; }
        if (++parser.macroCount <= parser.configuration.options['maxMacros']) {
            return;
        }
        if (isMacro) {
            throw new TexError_js_1.default('MaxMacroSub1', 'MathJax maximum macro substitution count exceeded; ' +
                'is here a recursive macro call?');
        }
        else {
            throw new TexError_js_1.default('MaxMacroSub2', 'MathJax maximum substitution count exceeded; ' +
                'is there a recursive latex environment?');
        }
    },
    checkEqnEnv: function (parser, nestable) {
        if (nestable === void 0) { nestable = true; }
        var top = parser.stack.Top();
        var first = top.First;
        if ((top.getProperty('nestable') && nestable && !first) ||
            top.getProperty('nestStart')) {
            return;
        }
        if (!top.isKind('start') || first) {
            throw new TexError_js_1.default('ErroneousNestingEq', 'Erroneous nesting of equation structures');
        }
    },
    copyNode: function (node, parser) {
        var tree = node.copy();
        var options = parser.configuration;
        tree.walkTree(function (n) {
            var e_1, _a;
            options.addNode(n.kind, n);
            var lists = (n.getProperty('in-lists') || '').split(/,/);
            try {
                for (var lists_1 = __values(lists), lists_1_1 = lists_1.next(); !lists_1_1.done; lists_1_1 = lists_1.next()) {
                    var list = lists_1_1.value;
                    if (list) {
                        options.addNode(list, n);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (lists_1_1 && !lists_1_1.done && (_a = lists_1.return)) _a.call(lists_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
        return tree;
    },
    mmlFilterAttribute: function (_parser, _name, value) {
        return value;
    },
    getFontDef: function (parser) {
        var font = parser.stack.env['font'];
        return font ? { mathvariant: font } : {};
    },
    keyvalOptions: function (attrib, allowed, error, l3keys) {
        var e_2, _a;
        if (allowed === void 0) { allowed = null; }
        if (error === void 0) { error = false; }
        if (l3keys === void 0) { l3keys = false; }
        var def = readKeyval(attrib, l3keys);
        if (allowed) {
            try {
                for (var _b = __values(Object.keys(def)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (Object.hasOwn(allowed, key)) {
                        if (allowed[key] instanceof KeyValueDef) {
                            var type = allowed[key];
                            var value = String(def[key]);
                            if (!type.verify(value)) {
                                throw new TexError_js_1.default('InvalidValue', "Value for key '%1' is not of the expected type", key);
                            }
                            def[key] = type.convert(value);
                        }
                    }
                    else {
                        if (error) {
                            throw new TexError_js_1.default('InvalidOption', 'Invalid option: %1', key);
                        }
                        delete def[key];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return def;
    },
    isLatinOrGreekChar: function (c) {
        return !!c.normalize('NFD').match(/[a-zA-Z\u0370-\u03F0]/);
    },
};
//# sourceMappingURL=ParseUtil.js.map