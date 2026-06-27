import TexError from './TexError.js';
import { lookup } from '../../util/Options.js';
import { ParseUtil } from './ParseUtil.js';
import { UnitUtil } from './UnitUtil.js';
export class ColumnParser {
    constructor() {
        this.columnHandler = {
            l: (state) => (state.calign[state.j++] = 'left'),
            c: (state) => (state.calign[state.j++] = 'center'),
            r: (state) => (state.calign[state.j++] = 'right'),
            p: (state) => this.getColumn(state, 'top'),
            m: (state) => this.getColumn(state, 'middle'),
            b: (state) => this.getColumn(state, 'bottom'),
            w: (state) => this.getColumn(state, 'top', ''),
            W: (state) => this.getColumn(state, 'top', ''),
            '|': (state) => this.addRule(state, 'solid'),
            ':': (state) => this.addRule(state, 'dashed'),
            '>': (state) => (state.cstart[state.j] =
                (state.cstart[state.j] || '') + this.getBraces(state)),
            '<': (state) => (state.cend[state.j - 1] =
                (state.cend[state.j - 1] || '') + this.getBraces(state)),
            '@': (state) => this.addAt(state, this.getBraces(state)),
            '!': (state) => this.addBang(state, this.getBraces(state)),
            '*': (state) => this.repeat(state),
            P: (state) => this.macroColumn(state, '>{$}p{#1}<{$}', 1),
            M: (state) => this.macroColumn(state, '>{$}m{#1}<{$}', 1),
            B: (state) => this.macroColumn(state, '>{$}b{#1}<{$}', 1),
            ' ': (_state) => { },
        };
        this.MAXCOLUMNS = 10000;
    }
    process(parser, template, array) {
        const state = {
            parser,
            template,
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
        let n = 0;
        while (state.i < state.template.length) {
            if (n++ > this.MAXCOLUMNS) {
                throw new TexError('MaxColumns', 'Too many column specifiers (perhaps looping column definitions?)');
            }
            const code = state.template.codePointAt(state.i);
            const c = (state.c = String.fromCodePoint(code));
            state.i += c.length;
            if (!Object.hasOwn(this.columnHandler, c)) {
                throw new TexError('BadPreamToken', 'Illegal pream-token (%1)', c);
            }
            this.columnHandler[c](state);
        }
        this.setColumnAlign(state, array);
        this.setColumnWidths(state, array);
        this.setColumnSpacing(state, array);
        this.setColumnLines(state, array);
        this.setPadding(state, array);
    }
    setColumnAlign(state, array) {
        array.arraydef.columnalign = state.calign.join(' ');
    }
    setColumnWidths(state, array) {
        if (!state.cwidth.length)
            return;
        const cwidth = [...state.cwidth];
        if (cwidth.length < state.calign.length) {
            cwidth.push('auto');
        }
        array.arraydef.columnwidth = cwidth.map((w) => w || 'auto').join(' ');
    }
    setColumnSpacing(state, array) {
        if (!state.cspace.length)
            return;
        const cspace = [...state.cspace];
        if (cspace.length < state.calign.length) {
            cspace.push('1em');
        }
        array.arraydef.columnspacing = cspace
            .slice(1)
            .map((d) => d || '1em')
            .join(' ');
    }
    setColumnLines(state, array) {
        if (!state.clines.length)
            return;
        const clines = [...state.clines];
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
                .map((l) => l || 'none')
                .join(' ');
        }
    }
    setPadding(state, array) {
        if (!state.cextra[0] && !state.cextra[state.calign.length - 1])
            return;
        const i = state.calign.length - 1;
        const cspace = state.cspace;
        const space = !state.cextra[i] ? null : cspace[i];
        array.arraydef['data-array-padding'] =
            `${cspace[0] || '.5em'} ${space || '.5em'}`;
    }
    getColumn(state, ralign, calign = 'left') {
        state.calign[state.j] = calign || this.getAlign(state);
        state.cwidth[state.j] = this.getDimen(state);
        state.ralign[state.j] = [
            ralign,
            state.cwidth[state.j],
            state.calign[state.j],
        ];
        state.j++;
    }
    getDimen(state) {
        const dim = this.getBraces(state);
        if (!UnitUtil.matchDimen(dim)[0]) {
            throw new TexError('MissingColumnDimOrUnits', 'Missing dimension or its units for %1 column declaration', state.c);
        }
        return dim;
    }
    getAlign(state) {
        const align = this.getBraces(state);
        return lookup(align.toLowerCase(), { l: 'left', c: 'center', r: 'right' }, '');
    }
    getBraces(state) {
        while (state.template[state.i] === ' ')
            state.i++;
        if (state.i >= state.template.length) {
            throw new TexError('MissingArgForColumn', 'Missing argument for %1 column declaration', state.c);
        }
        if (state.template[state.i] !== '{') {
            return state.template[state.i++];
        }
        const i = ++state.i;
        let braces = 1;
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
        throw new TexError('MissingCloseBrace', 'Missing close brace');
    }
    macroColumn(state, macro, n) {
        const args = [];
        while (n > 0 && n--) {
            args.push(this.getBraces(state));
        }
        state.template =
            ParseUtil.substituteArgs(state.parser, args, macro) +
                state.template.slice(state.i);
        state.i = 0;
    }
    addRule(state, rule) {
        if (state.clines[state.j]) {
            this.addAt(state, '\\,');
        }
        state.clines[state.j] = rule;
        if (state.cspace[state.j] === '0') {
            state.cstart[state.j] = '\\hspace{.5em}';
        }
    }
    addAt(state, macro) {
        const { cstart, cspace, j } = state;
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
    }
    addBang(state, macro) {
        const { cstart, cspace, j } = state;
        state.cextra[j] = true;
        state.calign[j] = 'center';
        cstart[j] =
            (cspace[j] === '0' && state.clines[j] ? '\\hspace{.25em}' : '') + macro;
        if (!cspace[j]) {
            cspace[j] = '.5em';
        }
        cspace[++state.j] = '.5em';
    }
    repeat(state) {
        const num = this.getBraces(state);
        const cols = this.getBraces(state);
        const n = parseInt(num);
        if (String(n) !== num) {
            throw new TexError('ColArgNotNum', 'First argument to %1 column specifier must be a number', '*');
        }
        state.template =
            new Array(n).fill(cols).join('') + state.template.substring(state.i);
        state.i = 0;
    }
}
//# sourceMappingURL=ColumnParser.js.map