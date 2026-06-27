const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/bbm/BbmConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bbm', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bbm: {
        BbmConfiguration: module1
      }
    }
  }
}});
