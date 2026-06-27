const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/html/HtmlConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/html/HtmlMethods.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/html', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      html: {
        HtmlConfiguration: module1,
        HtmlMethods: module2
      }
    }
  }
}});
