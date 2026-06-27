const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/centernot/CenternotConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/centernot', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      centernot: {
        CenternotConfiguration: module1
      }
    }
  }
}});
