const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/colortbl/ColortblConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/colortbl', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      colortbl: {
        ColortblConfiguration: module1
      }
    }
  }
}});
