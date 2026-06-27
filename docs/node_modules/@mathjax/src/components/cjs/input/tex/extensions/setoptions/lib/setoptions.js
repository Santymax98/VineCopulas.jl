const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/setoptions/SetOptionsConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/setoptions', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      setoptions: {
        SetOptionsConfiguration: module1
      }
    }
  }
}});
