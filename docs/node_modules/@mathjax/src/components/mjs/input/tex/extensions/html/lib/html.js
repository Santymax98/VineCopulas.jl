import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/html/HtmlConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/html/HtmlMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/html', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      html: {
        HtmlConfiguration: module1,
        HtmlMethods: module2
      }
    }
  }
}});
