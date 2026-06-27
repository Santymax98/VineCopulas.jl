const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/enclose/EncloseConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/enclose', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      enclose: {
        EncloseConfiguration: module1
      }
    }
  }
}});
