const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/require/RequireConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/require', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      require: {
        RequireConfiguration: module1
      }
    }
  }
}});
