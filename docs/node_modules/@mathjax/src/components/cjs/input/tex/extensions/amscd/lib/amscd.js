const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/amscd/AmsCdConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/amscd/AmsCdMethods.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/amscd', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      amscd: {
        AmsCdConfiguration: module1,
        AmsCdMethods: module2
      }
    }
  }
}});
