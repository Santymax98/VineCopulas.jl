import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/ui/safe/SafeHandler.js';
import * as module2 from '../../../../../mjs/ui/safe/SafeMethods.js';
import * as module3 from '../../../../../mjs/ui/safe/safe.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('ui/safe', VERSION, 'ui');
}

combineWithMathJax({_: {
  ui: {
    safe: {
      SafeHandler: module1,
      SafeMethods: module2,
      safe: module3
    }
  }
}});
