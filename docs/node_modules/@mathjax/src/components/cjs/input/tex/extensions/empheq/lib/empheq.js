const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/empheq/EmpheqConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/empheq/EmpheqUtil.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/empheq', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      empheq: {
        EmpheqConfiguration: module1,
        EmpheqUtil: module2
      }
    }
  }
}});
