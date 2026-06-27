import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/texhtml/TexHtmlConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/texhtml', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      texhtml: {
        TexHtmlConfiguration: module1
      }
    }
  }
}});
