const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/autoload/AutoloadConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/autoload', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      autoload: {
        AutoloadConfiguration: module1
      }
    }
  }
}});
