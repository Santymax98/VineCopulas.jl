import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/begingroup/BegingroupConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/begingroup/BegingroupMethods.js';
import * as module3 from '../../../../../../../mjs/input/tex/begingroup/BegingroupStack.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/begingroup', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      begingroup: {
        BegingroupConfiguration: module1,
        BegingroupMethods: module2,
        BegingroupStack: module3
      }
    }
  }
}});
