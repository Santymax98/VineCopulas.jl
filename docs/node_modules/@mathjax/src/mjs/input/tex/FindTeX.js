import { AbstractFindMath } from '../../core/FindMath.js';
import { sortLength, quotePattern } from '../../util/string.js';
import { protoItem } from '../../core/MathItem.js';
export class FindTeX extends AbstractFindMath {
    constructor(options) {
        super(options);
        this.getPatterns();
    }
    getPatterns() {
        const options = this.options;
        const starts = [];
        const parts = [];
        const subparts = [];
        this.end = {};
        this.env = this.sub = 0;
        let i = 1;
        options['inlineMath'].forEach((delims) => this.addPattern(starts, delims, false));
        options['displayMath'].forEach((delims) => this.addPattern(starts, delims, true));
        if (starts.length) {
            parts.push(starts.sort(sortLength).join('|'));
        }
        if (options['processEnvironments']) {
            parts.push('\\\\begin\\s*\\{([^}]*)\\}');
            this.env = i;
            i++;
        }
        if (options['processEscapes']) {
            subparts.push('\\\\([\\\\$])');
        }
        if (options['processRefs']) {
            subparts.push('(\\\\(?:eq)?ref\\s*\\{[^}]*\\})');
        }
        if (subparts.length) {
            parts.push('(' + subparts.join('|') + ')');
            this.sub = i;
        }
        this.start = new RegExp(parts.join('|'), 'g');
        this.hasPatterns = parts.length > 0;
    }
    addPattern(starts, delims, display) {
        const [open, close] = delims;
        starts.push(quotePattern(open));
        this.end[open] = [close, display, this.endPattern(close)];
    }
    endPattern(end, endp) {
        return new RegExp((endp || quotePattern(end)) + '|\\\\(?:[a-zA-Z]|.)|[{}]', 'g');
    }
    findEnd(text, n, start, end) {
        const [close, display, pattern] = end;
        const i = (pattern.lastIndex = start.index + start[0].length);
        let match, braces = 0;
        while ((match = pattern.exec(text))) {
            if ((match[1] || match[0]) === close && braces === 0) {
                return protoItem(start[0], text.substring(i, match.index), match[0], n, start.index, match.index + match[0].length, display);
            }
            else if (match[0] === '{') {
                braces++;
            }
            else if (match[0] === '}' && braces) {
                braces--;
            }
        }
        return null;
    }
    findMathInString(math, n, text) {
        let start, match;
        this.start.lastIndex = 0;
        while ((start = this.start.exec(text))) {
            if (start[this.env] !== undefined && this.env) {
                const end = '\\\\end\\s*(\\{' + quotePattern(start[this.env]) + '\\})';
                match = this.findEnd(text, n, start, [
                    '{' + start[this.env] + '}',
                    true,
                    this.endPattern(null, end),
                ]);
                if (match) {
                    match.math = match.open + match.math + match.close;
                    match.open = match.close = '';
                }
            }
            else if (start[this.sub] !== undefined && this.sub) {
                const math = start[this.sub];
                const end = start.index + start[this.sub].length;
                if (math.length === 2) {
                    match = protoItem('\\', math.substring(1), '', n, start.index, end);
                }
                else {
                    match = protoItem('', math, '', n, start.index, end, false);
                }
            }
            else {
                match = this.findEnd(text, n, start, this.end[start[0]]);
            }
            if (match) {
                math.push(match);
                this.start.lastIndex = match.end.n;
            }
        }
    }
    findMath(strings) {
        const math = [];
        if (this.hasPatterns) {
            for (let i = 0, m = strings.length; i < m; i++) {
                this.findMathInString(math, i, strings[i]);
            }
        }
        return math;
    }
}
FindTeX.OPTIONS = {
    inlineMath: [
        ['\\(', '\\)']
    ],
    displayMath: [
        ['$$', '$$'],
        ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    processRefs: true,
};
//# sourceMappingURL=FindTeX.js.map