const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/mathml/mml3/mml3-node.js');
const module2 = require('../../../../../../../cjs/input/mathml/mml3/mml3.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[mml]/mml3', VERSION, 'input/mml/extensions');
}

combineWithMathJax({_: {
  input: {
    mathml: {
      mml3: {
        "mml3-node": module1,
        mml3: module2
      }
    }
  }
}});
