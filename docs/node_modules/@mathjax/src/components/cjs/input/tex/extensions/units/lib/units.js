const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/units/UnitsConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/units', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      units: {
        UnitsConfiguration: module1
      }
    }
  }
}});
