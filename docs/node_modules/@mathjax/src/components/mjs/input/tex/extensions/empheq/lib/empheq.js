import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/empheq/EmpheqConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/empheq/EmpheqUtil.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/empheq', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      empheq: {
        EmpheqConfiguration: module1,
        EmpheqUtil: module2
      }
    }
  }
}});
