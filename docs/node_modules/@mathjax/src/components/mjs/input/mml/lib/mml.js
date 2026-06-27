import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/input/mathml.js';
import * as module2 from '../../../../../mjs/input/mathml/FindMathML.js';
import * as module3 from '../../../../../mjs/input/mathml/MathMLCompile.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/mml', VERSION, 'input');
}

combineWithMathJax({_: {
  input: {
    mathml_ts: module1,
    mathml: {
      FindMathML: module2,
      MathMLCompile: module3
    }
  }
}});
