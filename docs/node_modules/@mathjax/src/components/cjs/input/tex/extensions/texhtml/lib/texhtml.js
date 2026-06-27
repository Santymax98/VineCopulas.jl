const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/texhtml/TexHtmlConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/texhtml', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      texhtml: {
        TexHtmlConfiguration: module1
      }
    }
  }
}});
