import {combineWithMathJax} from '../../../../mjs/components/global.js';
import {VERSION} from '../../../../mjs/components/version.js';

import * as module1 from '../../../../mjs/components/loader.js';
import * as module2 from '../../../../mjs/components/package.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('loader', VERSION, 'loader');
}

combineWithMathJax({_: {
  components: {
    loader: module1,
    package: module2
  }
}});
