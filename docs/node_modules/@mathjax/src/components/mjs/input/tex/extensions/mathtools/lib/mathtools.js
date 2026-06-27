import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/mathtools/MathtoolsConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/mathtools/MathtoolsItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/mathtools/MathtoolsMethods.js';
import * as module4 from '../../../../../../../mjs/input/tex/mathtools/MathtoolsTags.js';
import * as module5 from '../../../../../../../mjs/input/tex/mathtools/MathtoolsUtil.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/mathtools', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      mathtools: {
        MathtoolsConfiguration: module1,
        MathtoolsItems: module2,
        MathtoolsMethods: module3,
        MathtoolsTags: module4,
        MathtoolsUtil: module5
      }
    }
  }
}});
