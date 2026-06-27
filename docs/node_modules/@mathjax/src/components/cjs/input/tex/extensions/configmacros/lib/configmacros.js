const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/configmacros/ConfigMacrosConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/configmacros', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      configmacros: {
        ConfigMacrosConfiguration: module1
      }
    }
  }
}});
