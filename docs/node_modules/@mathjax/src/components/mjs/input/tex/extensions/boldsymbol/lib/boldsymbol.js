import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/boldsymbol/BoldsymbolConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/boldsymbol', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      boldsymbol: {
        BoldsymbolConfiguration: module1
      }
    }
  }
}});
