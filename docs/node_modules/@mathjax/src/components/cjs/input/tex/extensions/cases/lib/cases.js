const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/cases/CasesConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/cases', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      cases: {
        CasesConfiguration: module1
      }
    }
  }
}});
