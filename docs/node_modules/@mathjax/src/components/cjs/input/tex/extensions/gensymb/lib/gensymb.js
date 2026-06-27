const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/gensymb/GensymbConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/gensymb', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      gensymb: {
        GensymbConfiguration: module1
      }
    }
  }
}});
