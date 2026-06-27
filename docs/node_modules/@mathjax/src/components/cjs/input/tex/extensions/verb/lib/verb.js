const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/verb/VerbConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/verb', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      verb: {
        VerbConfiguration: module1
      }
    }
  }
}});
