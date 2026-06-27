import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/units/UnitsConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/units', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      units: {
        UnitsConfiguration: module1
      }
    }
  }
}});
