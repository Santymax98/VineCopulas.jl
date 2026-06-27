import { AbstractFindMath } from '../../core/FindMath.js';
import { quotePattern } from '../../util/string.js';
import { protoItem } from '../../core/MathItem.js';
export class FindAsciiMath extends AbstractFindMath {
    constructor(options) {
        super(options);
        this.getPatterns();
    }
    getPatterns() {
        const options = this.options;
        const starts = [];
        this.end = {};
        options['delimiters'].forEach((delims) => this.addPattern(starts, delims, false));
        this.start = new RegExp(starts.join('|'), 'g');
        this.hasPatterns = starts.length > 0;
    }
    addPattern(starts, delims, display) {
        const [open, close] = delims;
        starts.push(quotePattern(open));
        this.end[open] = [close, display, new RegExp(quotePattern(close), 'g')];
    }
    findEnd(text, n, start, end) {
        const [, display, pattern] = end;
        const i = (pattern.lastIndex = start.index + start[0].length);
        const match = pattern.exec(text);
        return !match
            ? null
            : protoItem(start[0], match.index < i ? '' : text.substring(i, match.index), match[0], n, start.index, match.index + match[0].length, display);
    }
    findMathInString(math, n, text) {
        let start, match;
        this.start.lastIndex = 0;
        while ((start = this.start.exec(text))) {
            match = this.findEnd(text, n, start, this.end[start[0]]);
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
FindAsciiMath.OPTIONS = {
    delimiters: [['`', '`']],
};
//# sourceMappingURL=FindAsciiMath.js.map