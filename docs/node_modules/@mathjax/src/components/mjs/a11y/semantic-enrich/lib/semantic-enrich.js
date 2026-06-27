import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/a11y/semantic-enrich.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/semantic-enrich', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    "semantic-enrich": module1
  }
}});
