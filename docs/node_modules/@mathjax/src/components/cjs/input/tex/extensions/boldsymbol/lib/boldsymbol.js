const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/boldsymbol/BoldsymbolConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/boldsymbol', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      boldsymbol: {
        BoldsymbolConfiguration: module1
      }
    }
  }
}});
