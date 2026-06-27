import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/require/RequireConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/require', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      require: {
        RequireConfiguration: module1
      }
    }
  }
}});
