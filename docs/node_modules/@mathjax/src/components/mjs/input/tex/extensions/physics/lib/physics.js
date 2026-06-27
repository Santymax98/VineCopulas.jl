import {combineWithMathJax} from '../../../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../../../mjs/components/version.js';

import * as module1 from '../../../../../../../mjs/input/tex/physics/PhysicsConfiguration.js';
import * as module2 from '../../../../../../../mjs/input/tex/physics/PhysicsItems.js';
import * as module3 from '../../../../../../../mjs/input/tex/physics/PhysicsMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/physics', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      physics: {
        PhysicsConfiguration: module1,
        PhysicsItems: module2,
        PhysicsMethods: module3
      }
    }
  }
}});
