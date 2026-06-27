const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/mhchem/MhchemConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/mhchem', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      mhchem: {
        MhchemConfiguration: module1
      }
    }
  }
}});
