const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/bboldx/BboldxConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/bboldx/BboldxMethods.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bboldx', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bboldx: {
        BboldxConfiguration: module1,
        BboldxMethods: module2
      }
    }
  }
}});
