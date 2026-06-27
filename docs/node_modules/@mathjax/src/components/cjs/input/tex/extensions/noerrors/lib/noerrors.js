const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/noerrors/NoErrorsConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/noerrors', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      noerrors: {
        NoErrorsConfiguration: module1
      }
    }
  }
}});
