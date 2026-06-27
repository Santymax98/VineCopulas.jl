import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/enclose/EncloseConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/enclose', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      enclose: {
        EncloseConfiguration: module1
      }
    }
  }
}});
