import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/color/ColorConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/color/ColorConstants.js';
import * as module3 from '../../../../../../../mjs/input/tex/color/ColorMethods.js';
import * as module4 from '../../../../../../../mjs/input/tex/color/ColorUtil.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/color', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      color: {
        ColorConfiguration: module1,
        ColorConstants: module2,
        ColorMethods: module3,
        ColorUtil: module4
      }
    }
  }
}});
