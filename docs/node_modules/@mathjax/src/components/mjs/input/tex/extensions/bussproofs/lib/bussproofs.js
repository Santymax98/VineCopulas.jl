import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/bussproofs/BussproofsConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/bussproofs/BussproofsItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/bussproofs/BussproofsMethods.js';
import * as module4 from '../../../../../../../mjs/input/tex/bussproofs/BussproofsUtil.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bussproofs', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bussproofs: {
        BussproofsConfiguration: module1,
        BussproofsItems: module2,
        BussproofsMethods: module3,
        BussproofsUtil: module4
      }
    }
  }
}});
