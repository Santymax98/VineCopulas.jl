import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/bboldx/BboldxConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/bboldx/BboldxMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bboldx', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bboldx: {
        BboldxConfiguration: module1,
        BboldxMethods: module2
      }
    }
  }
}});
