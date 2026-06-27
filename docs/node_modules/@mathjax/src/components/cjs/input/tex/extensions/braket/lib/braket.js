const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/braket/BraketConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/braket/BraketItems.js');
const module3 = require('../../../../../../../cjs/input/tex/braket/BraketMethods.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/braket', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      braket: {
        BraketConfiguration: module1,
        BraketItems: module2,
        BraketMethods: module3
      }
    }
  }
}});
