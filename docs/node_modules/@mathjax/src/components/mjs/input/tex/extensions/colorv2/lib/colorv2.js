import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/colorv2/ColorV2Configuration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/colorv2', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      colorv2: {
        ColorV2Configuration: module1
      }
    }
  }
}});
