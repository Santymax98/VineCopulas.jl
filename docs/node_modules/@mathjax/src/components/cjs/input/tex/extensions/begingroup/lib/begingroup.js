const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/begingroup/BegingroupConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/begingroup/BegingroupMethods.js');
const module3 = require('../../../../../../../cjs/input/tex/begingroup/BegingroupStack.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/begingroup', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      begingroup: {
        BegingroupConfiguration: module1,
        BegingroupMethods: module2,
        BegingroupStack: module3
      }
    }
  }
}});
