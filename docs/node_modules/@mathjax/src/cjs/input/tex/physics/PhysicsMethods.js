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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var BaseMethods_js_1 = __importDefault(require("../base/BaseMethods.js"));
var TexParser_js_1 = __importDefault(require("../TexParser.js"));
var TexError_js_1 = __importDefault(require("../TexError.js"));
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var NodeFactory_js_1 = require("../NodeFactory.js");
var pairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '|': '|',
};
var biggs = /^(b|B)i(g{1,2})$/;
var latinCap = [0x41, 0x5a];
var latinSmall = [0x61, 0x7a];
var greekCap = [0x391, 0x3a9];
var greekSmall = [0x3b1, 0x3c9];
var digits = [0x30, 0x39];
function inRange(value, range) {
    return value >= range[0] && value <= range[1];
}
function createVectorToken(factory, kind, def, text) {
    var parser = factory.configuration.parser;
    var token = NodeFactory_js_1.NodeFactory.createToken(factory, kind, def, text);
    var code = text.codePointAt(0);
    if (text.length === 1 &&
        !parser.stack.env.font &&
        parser.stack.env.vectorFont &&
        (inRange(code, latinCap) ||
            inRange(code, latinSmall) ||
            inRange(code, greekCap) ||
            inRange(code, digits) ||
            (inRange(code, greekSmall) && parser.stack.env.vectorStar) ||
            NodeUtil_js_1.default.getAttribute(token, 'accent'))) {
        NodeUtil_js_1.default.setAttribute(token, 'mathvariant', parser.stack.env.vectorFont);
    }
    return token;
}
function vectorApplication(parser, kind, name, operator, fences) {
    var op = new TexParser_js_1.default(operator, parser.stack.env, parser.configuration).mml();
    parser.Push(parser.itemFactory.create(kind, op));
    var left = parser.GetNext();
    var right = pairs[left];
    if (!right) {
        return;
    }
    var lfence = '', rfence = '', arg = '';
    var enlarge = fences.includes(left);
    if (left === '{') {
        arg = parser.GetArgument(name);
        lfence = enlarge ? '\\left\\{' : '';
        rfence = enlarge ? '\\right\\}' : '';
        var macro = "".concat(lfence, " ").concat(arg, " ").concat(rfence);
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
        return;
    }
    if (!enlarge) {
        return;
    }
    parser.i++;
    parser.Push(parser.itemFactory
        .create('auto open')
        .setProperties({ open: left, close: right }));
}
function outputBraket(_a, star1, star2) {
    var _b = __read(_a, 3), arg1 = _b[0], arg2 = _b[1], arg3 = _b[2];
    return star1 && star2
        ? "\\left\\langle{".concat(arg1, "}\\middle\\vert{").concat(arg2, "}\\middle\\vert{").concat(arg3, "}\\right\\rangle")
        : star1
            ? "\\langle{".concat(arg1, "}\\vert{").concat(arg2, "}\\vert{").concat(arg3, "}\\rangle")
            : "\\left\\langle{".concat(arg1, "}\\right\\vert{").concat(arg2, "}\\left\\vert{").concat(arg3, "}\\right\\rangle");
}
function makeDiagMatrix(elements, anti) {
    var length = elements.length;
    var matrix = [];
    for (var i = 0; i < length; i++) {
        matrix.push(Array(anti ? length - i : i + 1).join('&') + "\\mqty{".concat(elements[i], "}"));
    }
    return matrix.join('\\\\ ');
}
var PhysicsMethods = {
    Quantity: function (parser, name, open, close, arg, named, variant) {
        if (open === void 0) { open = '('; }
        if (close === void 0) { close = ')'; }
        if (arg === void 0) { arg = false; }
        if (named === void 0) { named = ''; }
        if (variant === void 0) { variant = ''; }
        var star = arg ? parser.GetStar() : false;
        var next = parser.GetNext();
        var position = parser.i;
        var big = null;
        if (next === '\\') {
            parser.i++;
            big = parser.GetCS();
            if (!big.match(biggs)) {
                var empty = parser.create('node', 'mrow');
                parser.Push(ParseUtil_js_1.ParseUtil.fenced(parser.configuration, open, empty, close));
                parser.i = position;
                return;
            }
            next = parser.GetNext();
        }
        var right = pairs[next];
        if (arg && next !== '{') {
            throw new TexError_js_1.default('MissingArgFor', 'Missing argument for %1', parser.currentCS);
        }
        if (!right) {
            var empty = parser.create('node', 'mrow');
            parser.Push(ParseUtil_js_1.ParseUtil.fenced(parser.configuration, open, empty, close));
            parser.i = position;
            return;
        }
        if (named) {
            var mml = parser.create('token', 'mi', { texClass: MmlNode_js_1.TEXCLASS.OP }, named);
            if (variant) {
                NodeUtil_js_1.default.setAttribute(mml, 'mathvariant', variant);
            }
            parser.Push(parser.itemFactory.create('fn', mml));
        }
        if (next === '{') {
            var argument = parser.GetArgument(name);
            next = arg ? open : '\\{';
            right = arg ? close : '\\}';
            argument = star
                ? "".concat(next, " ").concat(argument, " ").concat(right)
                : big
                    ? "\\".concat(big, "l").concat(next, " ").concat(argument, " \\").concat(big, "r").concat(right)
                    : "\\left".concat(next, " ").concat(argument, " \\right").concat(right);
            parser.Push(new TexParser_js_1.default(argument, parser.stack.env, parser.configuration).mml());
            return;
        }
        parser.i++;
        parser.Push(parser.itemFactory
            .create('auto open')
            .setProperties({ open: next, close: right, big: big }));
    },
    Eval: function (parser, name) {
        var star = parser.GetStar();
        var next = parser.GetNext();
        if (next === '(' || next === '[') {
            parser.i++;
            parser.Push(parser.itemFactory.create('auto open').setProperties({
                open: next,
                close: '|',
                smash: star,
                right: '\\vphantom{\\int}',
            }));
            return;
        }
        var replace = '\\left.\\vphantom{\\int}\\right|';
        if (next === '{') {
            var arg = parser.GetArgument(name);
            replace = "\\left.".concat(star ? "\\smash{".concat(arg, "}") : arg, "\\vphantom{\\int}\\right|");
        }
        parser.string =
            parser.string.substring(0, parser.i) +
                replace +
                parser.string.slice(parser.i);
    },
    Commutator: function (parser, name, open, close) {
        if (open === void 0) { open = '['; }
        if (close === void 0) { close = ']'; }
        var star = parser.GetStar();
        var next = parser.GetNext();
        var big = null;
        if (next === '\\') {
            parser.i++;
            big = parser.GetCS();
            if (!big.match(biggs)) {
                throw new TexError_js_1.default('MissingArgFor', 'Missing argument for %1', parser.currentCS);
            }
            next = parser.GetNext();
        }
        if (next !== '{') {
            throw new TexError_js_1.default('MissingArgFor', 'Missing argument for %1', parser.currentCS);
        }
        var arg1 = parser.GetArgument(name);
        var arg2 = parser.GetArgument(name);
        var argument = arg1 + ',' + arg2;
        argument = star
            ? "".concat(open, " ").concat(argument, " ").concat(close)
            : big
                ? "\\".concat(big, "l").concat(open, " ").concat(argument, " \\").concat(big, "r").concat(close)
                : "\\left".concat(open, " ").concat(argument, " \\right").concat(close);
        parser.Push(new TexParser_js_1.default(argument, parser.stack.env, parser.configuration).mml());
    },
    VectorBold: function (parser, name) {
        var star = parser.GetStar();
        var arg = parser.GetArgument(name);
        var oldToken = parser.configuration.nodeFactory.get('token');
        var oldFont = parser.stack.env.font;
        delete parser.stack.env.font;
        parser.configuration.nodeFactory.set('token', createVectorToken);
        parser.stack.env.vectorFont = star ? 'bold-italic' : 'bold';
        parser.stack.env.vectorStar = star;
        var node = new TexParser_js_1.default(arg, parser.stack.env, parser.configuration).mml();
        if (oldFont) {
            parser.stack.env.font = oldFont;
        }
        delete parser.stack.env.vectorFont;
        delete parser.stack.env.vectorStar;
        parser.configuration.nodeFactory.set('token', oldToken);
        parser.Push(node);
    },
    StarMacro: function (parser, name, argcount) {
        var parts = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            parts[_i - 3] = arguments[_i];
        }
        var star = parser.GetStar();
        var args = [];
        if (argcount) {
            for (var i = args.length; i < argcount; i++) {
                args.push(parser.GetArgument(name));
            }
        }
        var macro = parts.join(star ? '*' : '');
        macro = ParseUtil_js_1.ParseUtil.substituteArgs(parser, args, macro);
        parser.string = ParseUtil_js_1.ParseUtil.addArgs(parser, macro, parser.string.slice(parser.i));
        parser.i = 0;
        ParseUtil_js_1.ParseUtil.checkMaxMacros(parser);
    },
    OperatorApplication: function (parser, name, operator) {
        var fences = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            fences[_i - 3] = arguments[_i];
        }
        vectorApplication(parser, 'fn', name, operator, fences);
    },
    VectorOperator: function (parser, name, operator) {
        var fences = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            fences[_i - 3] = arguments[_i];
        }
        vectorApplication(parser, 'mml', name, operator, fences);
    },
    Expression: function (parser, name, opt, id) {
        if (opt === void 0) { opt = true; }
        if (id === void 0) { id = ''; }
        id = id || name.slice(1);
        var exp = opt ? parser.GetBrackets(name) : null;
        var mml = parser.create('token', 'mi', { texClass: MmlNode_js_1.TEXCLASS.OP }, id);
        if (exp) {
            var sup = new TexParser_js_1.default(exp, parser.stack.env, parser.configuration).mml();
            mml = parser.create('node', 'msup', [mml, sup]);
        }
        parser.Push(parser.itemFactory.create('fn', mml));
        if (parser.GetNext() !== '(') {
            return;
        }
        parser.i++;
        parser.Push(parser.itemFactory
            .create('auto open')
            .setProperties({ open: '(', close: ')' }));
    },
    Qqtext: function (parser, name, text) {
        var star = parser.GetStar();
        var arg = text ? text : parser.GetArgument(name);
        var replace = (star ? '' : '\\quad') + '\\text{' + arg + '}\\quad ';
        parser.string =
            parser.string.slice(0, parser.i) +
                replace +
                parser.string.slice(parser.i);
    },
    Differential: function (parser, name, op) {
        var optArg = parser.GetBrackets(name);
        var power = optArg != null ? '^{' + optArg + '}' : ' ';
        var parens = parser.GetNext() === '(';
        var braces = parser.GetNext() === '{';
        var macro = op + power;
        if (!(parens || braces)) {
            macro += parser.GetArgument(name, true) || '';
            var mml = new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml();
            parser.Push(mml);
            return;
        }
        if (braces) {
            macro += parser.GetArgument(name);
            var mml = new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml();
            parser.Push(parser.create('node', 'TeXAtom', [mml], { texClass: MmlNode_js_1.TEXCLASS.OP }));
            return;
        }
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
        parser.i++;
        parser.Push(parser.itemFactory
            .create('auto open')
            .setProperties({ open: '(', close: ')' }));
    },
    Derivative: function (parser, name, argMax, op) {
        var star = parser.GetStar();
        var optArg = parser.GetBrackets(name);
        var argCounter = 1;
        var args = [];
        args.push(parser.GetArgument(name));
        while (parser.GetNext() === '{' && argCounter < argMax) {
            args.push(parser.GetArgument(name));
            argCounter++;
        }
        var ignore = false;
        var power1 = ' ';
        var power2 = ' ';
        if (argMax > 2 && args.length > 2) {
            power1 = '^{' + (args.length - 1) + '}';
            ignore = true;
        }
        else if (optArg != null) {
            if (argMax > 2 && args.length > 1) {
                ignore = true;
            }
            power1 = "^{".concat(optArg, "}");
            power2 = power1;
        }
        var frac = star ? '\\flatfrac' : '\\frac';
        var first = args.length > 1 ? args[0] : '';
        var second = args.length > 1 ? args[1] : args[0];
        var rest = '';
        for (var i = 2, arg = void 0; (arg = args[i]); i++) {
            rest += op + ' ' + arg;
        }
        var macro = "".concat(frac, "{").concat(op).concat(power1).concat(first, "}{").concat(op, " ").concat(second).concat(power2, " ").concat(rest, "}");
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
        if (parser.GetNext() === '(') {
            parser.i++;
            parser.Push(parser.itemFactory
                .create('auto open')
                .setProperties({ open: '(', close: ')', ignore: ignore }));
        }
    },
    Bra: function (parser, name) {
        var starBra = parser.GetStar();
        var bra = parser.GetArgument(name);
        var ket = '';
        var hasKet = false;
        var starKet = false;
        if (parser.GetNext() === '\\') {
            var saveI = parser.i;
            parser.i++;
            var cs = parser.GetCS();
            var token = parser.lookup(HandlerTypes_js_1.HandlerType.MACRO, cs);
            if (token && token.token === 'ket') {
                hasKet = true;
                saveI = parser.i;
                starKet = parser.GetStar();
                if (parser.GetNext() === '{') {
                    ket = parser.GetArgument(cs, true);
                }
                else {
                    parser.i = saveI;
                    starKet = false;
                }
            }
            else {
                parser.i = saveI;
            }
        }
        var macro = '';
        if (hasKet) {
            macro =
                starBra || starKet
                    ? "\\langle{".concat(bra, "}\\vert{").concat(ket, "}\\rangle")
                    : "\\left\\langle{".concat(bra, "}\\middle\\vert{").concat(ket, "}\\right\\rangle");
        }
        else {
            macro = starBra
                ? "\\langle{".concat(bra, "}\\vert")
                : "\\left\\langle{".concat(bra, "}\\right\\vert{").concat(ket, "}");
        }
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    Ket: function (parser, name) {
        var star = parser.GetStar();
        var ket = parser.GetArgument(name);
        var macro = star
            ? "\\vert{".concat(ket, "}\\rangle")
            : "\\left\\vert{".concat(ket, "}\\right\\rangle");
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    BraKet: function (parser, name) {
        var star = parser.GetStar();
        var bra = parser.GetArgument(name);
        var ket = null;
        if (parser.GetNext() === '{') {
            ket = parser.GetArgument(name, true);
        }
        var macro = '';
        if (ket == null) {
            macro = star
                ? "\\langle{".concat(bra, "}\\vert{").concat(bra, "}\\rangle")
                : "\\left\\langle{".concat(bra, "}\\middle\\vert{").concat(bra, "}\\right\\rangle");
        }
        else {
            macro = star
                ? "\\langle{".concat(bra, "}\\vert{").concat(ket, "}\\rangle")
                : "\\left\\langle{".concat(bra, "}\\middle\\vert{").concat(ket, "}\\right\\rangle");
        }
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    KetBra: function (parser, name) {
        var star = parser.GetStar();
        var ket = parser.GetArgument(name);
        var bra = null;
        if (parser.GetNext() === '{') {
            bra = parser.GetArgument(name, true);
        }
        var macro = '';
        if (bra == null) {
            macro = star
                ? "\\vert{".concat(ket, "}\\rangle\\!\\langle{").concat(ket, "}\\vert")
                : "\\left\\vert{".concat(ket, "}\\middle\\rangle\\!\\middle\\langle{").concat(ket, "}\\right\\vert");
        }
        else {
            macro = star
                ? "\\vert{".concat(ket, "}\\rangle\\!\\langle{").concat(bra, "}\\vert")
                : "\\left\\vert{".concat(ket, "}\\middle\\rangle\\!\\middle\\langle{").concat(bra, "}\\right\\vert");
        }
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    Expectation: function (parser, name) {
        var star1 = parser.GetStar();
        var star2 = star1 && parser.GetStar();
        var arg1 = parser.GetArgument(name);
        var arg2 = null;
        if (parser.GetNext() === '{') {
            arg2 = parser.GetArgument(name, true);
        }
        var macro = arg1 && arg2
            ? outputBraket([arg2, arg1, arg2], star1, star2)
            :
                star1
                    ? "\\langle {".concat(arg1, "} \\rangle")
                    : "\\left\\langle {".concat(arg1, "} \\right\\rangle");
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    MatrixElement: function (parser, name) {
        var star1 = parser.GetStar();
        var star2 = star1 && parser.GetStar();
        var arg1 = parser.GetArgument(name);
        var arg2 = parser.GetArgument(name);
        var arg3 = parser.GetArgument(name);
        var macro = outputBraket([arg1, arg2, arg3], star1, star2);
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    MatrixQuantity: function (parser, name, small) {
        var star = parser.GetStar();
        var next = parser.GetNext();
        var array = small ? 'smallmatrix' : 'array';
        var arg = '';
        var open = '';
        var close = '';
        switch (next) {
            case '{':
                arg = parser.GetArgument(name);
                break;
            case '(':
                parser.i++;
                open = star ? '\\lgroup' : '(';
                close = star ? '\\rgroup' : ')';
                arg = parser.GetUpTo(name, ')');
                break;
            case '[':
                parser.i++;
                open = '[';
                close = ']';
                arg = parser.GetUpTo(name, ']');
                break;
            case '|':
                parser.i++;
                open = '|';
                close = '|';
                arg = parser.GetUpTo(name, '|');
                break;
            default:
                open = '(';
                close = ')';
                break;
        }
        var macro = (open ? '\\left' : '') +
            "".concat(open, "\\begin{").concat(array, "}{} ").concat(arg, "\\end{").concat(array, "}") +
            (open ? '\\right' : '') +
            close;
        parser.Push(new TexParser_js_1.default(macro, parser.stack.env, parser.configuration).mml());
    },
    IdentityMatrix: function (parser, name) {
        var arg = parser.GetArgument(name);
        var size = parseInt(arg, 10);
        if (isNaN(size)) {
            throw new TexError_js_1.default('InvalidNumber', 'Invalid number');
        }
        if (size <= 1) {
            parser.string = '1' + parser.string.slice(parser.i);
            parser.i = 0;
            return;
        }
        var zeros = Array(size).fill('0');
        var columns = [];
        for (var i = 0; i < size; i++) {
            var row = zeros.slice();
            row[i] = '1';
            columns.push(row.join(' & '));
        }
        parser.string = columns.join('\\\\ ') + parser.string.slice(parser.i);
        parser.i = 0;
    },
    XMatrix: function (parser, name) {
        var star = parser.GetStar();
        var arg1 = parser.GetArgument(name);
        var arg2 = parser.GetArgument(name);
        var arg3 = parser.GetArgument(name);
        var n = parseInt(arg2, 10);
        var m = parseInt(arg3, 10);
        if (isNaN(n) ||
            isNaN(m) ||
            m.toString() !== arg3 ||
            n.toString() !== arg2) {
            throw new TexError_js_1.default('InvalidNumber', 'Invalid number');
        }
        n = n < 1 ? 1 : n;
        m = m < 1 ? 1 : m;
        if (!star) {
            var row = Array(m).fill(arg1).join(' & ');
            var matrix_1 = Array(n).fill(row).join('\\\\ ');
            parser.string = matrix_1 + parser.string.slice(parser.i);
            parser.i = 0;
            return;
        }
        var matrix = '';
        if (n === 1 && m === 1) {
            matrix = arg1;
        }
        else if (n === 1) {
            var row = [];
            for (var i = 1; i <= m; i++) {
                row.push("".concat(arg1, "_{").concat(i, "}"));
            }
            matrix = row.join(' & ');
        }
        else if (m === 1) {
            var row = [];
            for (var i = 1; i <= n; i++) {
                row.push("".concat(arg1, "_{").concat(i, "}"));
            }
            matrix = row.join('\\\\ ');
        }
        else {
            var rows = [];
            for (var i = 1; i <= n; i++) {
                var row = [];
                for (var j = 1; j <= m; j++) {
                    row.push("".concat(arg1, "_{{").concat(i, "}{").concat(j, "}}"));
                }
                rows.push(row.join(' & '));
            }
            matrix = rows.join('\\\\ ');
        }
        parser.string = matrix + parser.string.slice(parser.i);
        parser.i = 0;
        return;
    },
    PauliMatrix: function (parser, name) {
        var arg = parser.GetArgument(name);
        var matrix = arg.slice(1);
        switch (arg[0]) {
            case '0':
                matrix += ' 1 & 0\\\\ 0 & 1';
                break;
            case '1':
            case 'x':
                matrix += ' 0 & 1\\\\ 1 & 0';
                break;
            case '2':
            case 'y':
                matrix += ' 0 & -i\\\\ i & 0';
                break;
            case '3':
            case 'z':
                matrix += ' 1 & 0\\\\ 0 & -1';
                break;
            default:
        }
        parser.string = matrix + parser.string.slice(parser.i);
        parser.i = 0;
    },
    DiagonalMatrix: function (parser, name, anti) {
        if (parser.GetNext() !== '{') {
            return;
        }
        var startI = parser.i;
        parser.GetArgument(name);
        var endI = parser.i;
        parser.i = startI + 1;
        var elements = [];
        var element = '';
        var currentI = parser.i;
        while (currentI < endI) {
            try {
                element = parser.GetUpTo(name, ',');
            }
            catch (_e) {
                parser.i = endI;
                elements.push(parser.string.slice(currentI, endI - 1));
                break;
            }
            currentI = parser.i;
            elements.push(element);
        }
        parser.string = makeDiagMatrix(elements, anti) + parser.string.slice(endI);
        parser.i = 0;
    },
    AutoClose: function (parser, fence, texclass) {
        var top = parser.stack.Top();
        if (top.isKind('over')) {
            top = parser.stack.Top(2);
        }
        if (!top.isKind('auto open') || !top.closing(fence)) {
            return false;
        }
        var mo = parser.create('token', 'mo', { texClass: texclass }, fence);
        parser.Push(parser.itemFactory
            .create('close')
            .setProperties({ 'pre-autoclose': true }));
        parser.Push(parser.itemFactory.create('mml', mo).setProperties({ autoclose: true }));
        return true;
    },
    Vnabla: function (parser, _name) {
        var argument = parser.options.physics.arrowdel
            ? '\\vec{\\gradientnabla}'
            : '{\\gradientnabla}';
        return parser.Push(new TexParser_js_1.default(argument, parser.stack.env, parser.configuration).mml());
    },
    DiffD: function (parser, _name) {
        var argument = parser.options.physics.italicdiff ? 'd' : '{\\rm d}';
        return parser.Push(new TexParser_js_1.default(argument, parser.stack.env, parser.configuration).mml());
    },
    Macro: BaseMethods_js_1.default.Macro,
    NamedFn: BaseMethods_js_1.default.NamedFn,
    Array: BaseMethods_js_1.default.Array,
};
exports.default = PhysicsMethods;
//# sourceMappingURL=PhysicsMethods.js.map