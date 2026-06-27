const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/unicode/UnicodeConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/unicode', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      unicode: {
        UnicodeConfiguration: module1
      }
    }
  }
}});
