import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/input/asciimath.js';
import * as module2 from '../../../../../mjs/input/asciimath/FindAsciiMath.js';
import * as module3 from '../../../../../mjs/input/asciimath/legacy.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/asciimath', VERSION, 'input');
}

combineWithMathJax({_: {
  input: {
    asciimath_ts: module1,
    asciimath: {
      FindAsciiMath: module2,
      legacy_ts: module3
    }
  }
}});
