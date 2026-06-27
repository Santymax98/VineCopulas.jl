import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/autoload/AutoloadConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/autoload', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      autoload: {
        AutoloadConfiguration: module1
      }
    }
  }
}});
