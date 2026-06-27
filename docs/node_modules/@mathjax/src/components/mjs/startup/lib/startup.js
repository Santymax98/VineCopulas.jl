import {combineWithMathJax} from '../../../../mjs/components/global.js';
import {VERSION} from '../../../../mjs/components/version.js';

import * as module1 from '../../../../mjs/components/loader.js';
import * as module2 from '../../../../mjs/components/package.js';
import * as module3 from '../../../../mjs/components/startup.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('startup', VERSION, 'startup');
}

combineWithMathJax({_: {
  components: {
    loader: module1,
    package: module2,
    startup: module3
  }
}});
