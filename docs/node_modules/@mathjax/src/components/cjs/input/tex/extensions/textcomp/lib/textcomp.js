const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/textcomp/TextcompConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/textcomp', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      textcomp: {
        TextcompConfiguration: module1
      }
    }
  }
}});
