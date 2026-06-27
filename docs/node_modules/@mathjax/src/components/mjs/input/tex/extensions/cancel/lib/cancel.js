import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/cancel/CancelConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/cancel', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      cancel: {
        CancelConfiguration: module1
      }
    }
  }
}});
