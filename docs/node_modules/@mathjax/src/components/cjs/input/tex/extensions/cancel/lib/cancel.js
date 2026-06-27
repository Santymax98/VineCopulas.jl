const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/cancel/CancelConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/cancel', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      cancel: {
        CancelConfiguration: module1
      }
    }
  }
}});
