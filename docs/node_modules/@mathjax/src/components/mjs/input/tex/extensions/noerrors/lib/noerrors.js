import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/noerrors/NoErrorsConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/noerrors', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      noerrors: {
        NoErrorsConfiguration: module1
      }
    }
  }
}});
