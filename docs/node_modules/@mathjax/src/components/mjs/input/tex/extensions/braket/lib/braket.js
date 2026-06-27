import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/braket/BraketConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/braket/BraketItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/braket/BraketMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/braket', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      braket: {
        BraketConfiguration: module1,
        BraketItems: module2,
        BraketMethods: module3
      }
    }
  }
}});
