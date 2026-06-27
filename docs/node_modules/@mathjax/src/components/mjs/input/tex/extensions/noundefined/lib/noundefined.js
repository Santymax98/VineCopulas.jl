import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/noundefined/NoUndefinedConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/noundefined', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      noundefined: {
        NoUndefinedConfiguration: module1
      }
    }
  }
}});
