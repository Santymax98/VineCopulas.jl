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
exports.ColumnParser = void 0;
var TexError_js_1 = __importDefault(require("./TexError.js"));
var Options_js_1 = require("../../util/Options.js");
var ParseUtil_js_1 = require("./ParseUtil.js");
var UnitUtil_js_1 = require("./UnitUtil.js");
var ColumnParser = (function () {
    function ColumnParser() {
        var _this = this;
        this.columnHandler = {
            l: function (state) { return (state.calign[state.j++] = 'left'); },
            c: function (state) { return (state.calign[state.j++] = 'center'); },
            r: function (state) { return (state.calign[state.j++] = 'right'); },
            p: function (state) { return _this.getColumn(state, 'top'); },
            m: function (state) { return _this.getColumn(state, 'middle'); },
            b: function (state) { return _this.getColumn(state, 'bottom'); },
            w: function (state) { return _this.getColumn(state, 'top', ''); },
            W: function (state) { return _this.getColumn(state, 'top', ''); },
            '|': function (state) { return _this.addRule(state, 'solid'); },
            ':': function (state) { return _this.addRule(state, 'dashed'); },
            '>': function (state) {
                return (state.cstart[state.j] =
                    (state.cstart[state.j] || '') + _this.getBraces(state));
            },
            '<': function (state) {
                return (state.cend[state.j - 1] =
                    (state.cend[state.j - 1] || '') + _this.getBraces(state));
            },
            '@': function (state) { return _this.addAt(state, _this.getBraces(state)); },
            '!': function (state) { return _this.addBang(state, _this.getBraces(state)); },
            '*': function (state) { return _this.repeat(state); },
            P: function (state) { return _this.macroColumn(state, '>{$}p{#1}<{$}', 1); },
            M: function (state) { return _this.macroColumn(state, '>{$}m{#1}<{$}', 1); },
            B: function (state) { return _this.macroColumn(state, '>{$}b{#1}<{$}', 1); },
            ' ': function (_state) { },
        };
        this.MAXCOLUMNS = 10000;
    }
    ColumnParser.prototype.process = function (parser, template, array) {
        var state = {
            parser: parser,
            template: template,
            i: 0,
            j: 0,
            c: '',
            cwidth: [],
            calign: [],
            cspace: [],
            clines: [],
            cstart: array.cstart,
            cend: array.cend,
            ralign: array.ralign,
            cextra: array.cextra,
        };
        var n = 0;
        while (state.i < state.template.length) {
            if (n++ > this.MAXCOLUMNS) {
                throw new TexError_js_1.default('MaxColumns', 'Too many column specifiers (perhaps looping column definitions?)');
            }
            var code = state.template.codePointAt(state.i);
            var c = (state.c = String.fromCodePoint(code));
            state.i += c.length;
            if (!Object.hasOwn(this.columnHandler, c)) {
                throw new TexError_js_1.default('BadPreamToken', 'Illegal pream-token (%1)', c);
            }
            this.columnHandler[c](state);
        }
        this.setColumnAlign(state, array);
        this.setColumnWidths(state, array);
        this.setColumnSpacing(state, array);
        this.setColumnLines(state, array);
        this.setPadding(state, array);
    };
    ColumnParser.prototype.setColumnAlign = function (state, array) {
        array.arraydef.columnalign = state.calign.join(' ');
    };
    ColumnParser.prototype.setColumnWidths = function (state, array) {
        if (!state.cwidth.length)
            return;
        var cwidth = __spreadArray([], __read(state.cwidth), false);
        if (cwidth.length < state.calign.length) {
            cwidth.push('auto');
        }
        array.arraydef.columnwidth = cwidth.map(function (w) { return w || 'auto'; }).join(' ');
    };
    ColumnParser.prototype.setColumnSpacing = function (state, array) {
        if (!state.cspace.length)
            return;
        var cspace = __spreadArray([], __read(state.cspace), false);
        if (cspace.length < state.calign.length) {
            cspace.push('1em');
        }
        array.arraydef.columnspacing = cspace
            .slice(1)
            .map(function (d) { return d || '1em'; })
            .join(' ');
    };
    ColumnParser.prototype.setColumnLines = function (state, array) {
        if (!state.clines.length)
            return;
        var clines = __spreadArray([], __read(state.clines), false);
        if (clines[0]) {
            array.frame.push(['left', clines[0]]);
        }
        if (clines.length > state.calign.length) {
            array.frame.push(['right', clines.pop()]);
        }
        else if (clines.length < state.calign.length) {
            clines.push('none');
        }
        if (clines.length > 1) {
            array.arraydef.columnlines = clines
                .slice(1)
                .map(function (l) { return l || 'none'; })
                .join(' ');
        }
    };
    ColumnParser.prototype.setPadding = function (state, array) {
        if (!state.cextra[0] && !state.cextra[state.calign.length - 1])
            return;
        var i = state.calign.length - 1;
        var cspace = state.cspace;
        var space = !state.cextra[i] ? null : cspace[i];
        array.arraydef['data-array-padding'] =
            "".concat(cspace[0] || '.5em', " ").concat(space || '.5em');
    };
    ColumnParser.prototype.getColumn = function (state, ralign, calign) {
        if (calign === void 0) { calign = 'left'; }
        state.calign[state.j] = calign || this.getAlign(state);
        state.cwidth[state.j] = this.getDimen(state);
        state.ralign[state.j] = [
            ralign,
            state.cwidth[state.j],
            state.calign[state.j],
        ];
        state.j++;
    };
    ColumnParser.prototype.getDimen = function (state) {
        var dim = this.getBraces(state);
        if (!UnitUtil_js_1.UnitUtil.matchDimen(dim)[0]) {
            throw new TexError_js_1.default('MissingColumnDimOrUnits', 'Missing dimension or its units for %1 column declaration', state.c);
        }
        return dim;
    };
    ColumnParser.prototype.getAlign = function (state) {
        var align = this.getBraces(state);
        return (0, Options_js_1.lookup)(align.toLowerCase(), { l: 'left', c: 'center', r: 'right' }, '');
    };
    ColumnParser.prototype.getBraces = function (state) {
        while (state.template[state.i] === ' ')
            state.i++;
        if (state.i >= state.template.length) {
            throw new TexError_js_1.default('MissingArgForColumn', 'Missing argument for %1 column declaration', state.c);
        }
        if (state.template[state.i] !== '{') {
            return state.template[state.i++];
        }
        var i = ++state.i;
        var braces = 1;
        while (state.i < state.template.length) {
            switch (state.template.charAt(state.i++)) {
                case '\\':
                    state.i++;
                    break;
                case '{':
                    braces++;
                    break;
                case '}':
                    if (--braces === 0) {
                        return state.template.slice(i, state.i - 1);
                    }
                    break;
            }
        }
        throw new TexError_js_1.default('MissingCloseBrace', 'Missing close brace');
    };
    ColumnParser.prototype.macroColumn = function (state, macro, n) {
        var args = [];
        while (n > 0 && n--) {
            args.push(this.getBraces(state));
        }
        state.template =
            ParseUtil_js_1.ParseUtil.substituteArgs(state.parser, args, macro) +
                state.template.slice(state.i);
        state.i = 0;
    };
    ColumnParser.prototype.addRule = function (state, rule) {
        if (state.clines[state.j]) {
            this.addAt(state, '\\,');
        }
        state.clines[state.j] = rule;
        if (state.cspace[state.j] === '0') {
            state.cstart[state.j] = '\\hspace{.5em}';
        }
    };
    ColumnParser.prototype.addAt = function (state, macro) {
        var cstart = state.cstart, cspace = state.cspace, j = state.j;
        state.cextra[j] = true;
        state.calign[j] = 'center';
        if (state.clines[j]) {
            if (cspace[j] === '.5em') {
                cstart[j - 1] += '\\hspace{.25em}';
            }
            else if (!cspace[j]) {
                state.cend[j - 1] = (state.cend[j - 1] || '') + '\\hspace{.5em}';
            }
        }
        cstart[j] = macro;
        cspace[j] = '0';
        cspace[++state.j] = '0';
    };
    ColumnParser.prototype.addBang = function (state, macro) {
        var cstart = state.cstart, cspace = state.cspace, j = state.j;
        state.cextra[j] = true;
        state.calign[j] = 'center';
        cstart[j] =
            (cspace[j] === '0' && state.clines[j] ? '\\hspace{.25em}' : '') + macro;
        if (!cspace[j]) {
            cspace[j] = '.5em';
        }
        cspace[++state.j] = '.5em';
    };
    ColumnParser.prototype.repeat = function (state) {
        var num = this.getBraces(state);
        var cols = this.getBraces(state);
        var n = parseInt(num);
        if (String(n) !== num) {
            throw new TexError_js_1.default('ColArgNotNum', 'First argument to %1 column specifier must be a number', '*');
        }
        state.template =
            new Array(n).fill(cols).join('') + state.template.substring(state.i);
        state.i = 0;
    };
    return ColumnParser;
}());
exports.ColumnParser = ColumnParser;
//# sourceMappingURL=ColumnParser.js.map