import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/tagformat/TagFormatConfiguration.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/tagformat', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      tagformat: {
        TagFormatConfiguration: module1
      }
    }
  }
}});
