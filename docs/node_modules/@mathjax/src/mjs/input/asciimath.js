import { AbstractInputJax } from '../core/InputJax.js';
import { LegacyAsciiMath } from './asciimath/legacy.js';
import { separateOptions } from '../util/Options.js';
import { FindAsciiMath } from './asciimath/FindAsciiMath.js';
export class AsciiMath extends AbstractInputJax {
    constructor(options) {
        const [, find, am] = separateOptions(options, FindAsciiMath.OPTIONS, AsciiMath.OPTIONS);
        super(am);
        this.findAsciiMath =
            this.options['FindAsciiMath'] || new FindAsciiMath(find);
    }
    compile(math, _document) {
        return LegacyAsciiMath.Compile(math.math, math.display);
    }
    findMath(strings) {
        return this.findAsciiMath.findMath(strings);
    }
}
AsciiMath.NAME = 'AsciiMath';
AsciiMath.OPTIONS = Object.assign(Object.assign({}, AbstractInputJax.OPTIONS), { FindAsciiMath: null });
//# sourceMappingURL=asciimath.js.map