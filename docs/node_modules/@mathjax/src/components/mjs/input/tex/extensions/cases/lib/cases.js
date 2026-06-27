import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/cases/CasesConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/cases', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      cases: {
        CasesConfiguration: module1
      }
    }
  }
}});
