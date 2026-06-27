import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/adaptors/jsdomAdaptor.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('adaptors/jsdom', VERSION, 'adaptors');
}

combineWithMathJax({_: {
  adaptors: {
    jsdomAdaptor: module1
  }
}});
