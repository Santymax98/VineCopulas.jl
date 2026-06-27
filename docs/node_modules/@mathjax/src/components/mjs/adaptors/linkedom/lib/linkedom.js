import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/adaptors/linkedomAdaptor.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('adaptors/linkedom', VERSION, 'adaptors');
}

combineWithMathJax({_: {
  adaptors: {
    linkedomAdaptor: module1
  }
}});
