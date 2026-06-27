import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/extpfeil/ExtpfeilConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/extpfeil', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      extpfeil: {
        ExtpfeilConfiguration: module1
      }
    }
  }
}});
