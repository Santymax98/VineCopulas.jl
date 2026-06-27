import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/bbm/BbmConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bbm', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bbm: {
        BbmConfiguration: module1
      }
    }
  }
}});
