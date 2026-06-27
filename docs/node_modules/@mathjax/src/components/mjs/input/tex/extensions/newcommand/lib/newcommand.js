import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/newcommand/NewcommandConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/newcommand/NewcommandItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/newcommand/NewcommandMethods.js';
import * as module4 from '../../../../../../../mjs/input/tex/newcommand/NewcommandUtil.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/newcommand', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      newcommand: {
        NewcommandConfiguration: module1,
        NewcommandItems: module2,
        NewcommandMethods: module3,
        NewcommandUtil: module4
      }
    }
  }
}});
