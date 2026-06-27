import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/unicode/UnicodeConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/unicode', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      unicode: {
        UnicodeConfiguration: module1
      }
    }
  }
}});
