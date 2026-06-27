import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/ams/AmsConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/ams/AmsItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/ams/AmsMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/ams', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      ams: {
        AmsConfiguration: module1,
        AmsItems: module2,
        AmsMethods: module3
      }
    }
  }
}});
