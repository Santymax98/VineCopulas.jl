const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/upgreek/UpgreekConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/upgreek', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      upgreek: {
        UpgreekConfiguration: module1
      }
    }
  }
}});
