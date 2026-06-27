const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/dsfont/DsfontConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/dsfont', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      dsfont: {
        DsfontConfiguration: module1
      }
    }
  }
}});
