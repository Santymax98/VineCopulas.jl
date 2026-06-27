const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/noundefined/NoUndefinedConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/noundefined', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      noundefined: {
        NoUndefinedConfiguration: module1
      }
    }
  }
}});
