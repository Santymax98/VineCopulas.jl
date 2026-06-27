const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/physics/PhysicsConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/physics/PhysicsItems.js');
const module3 = require('../../../../../../../cjs/input/tex/physics/PhysicsMethods.js');

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
