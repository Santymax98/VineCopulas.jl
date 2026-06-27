import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/ui/lazy/LazyHandler.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('ui/lazy', VERSION, 'ui');
}

combineWithMathJax({_: {
  ui: {
    lazy: {
      LazyHandler: module1
    }
  }
}});
