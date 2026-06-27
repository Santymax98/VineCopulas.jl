const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/textmacros/TextMacrosConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/textmacros/TextMacrosMethods.js');
const module3 = require('../../../../../../../cjs/input/tex/textmacros/TextParser.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/textmacros', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      textmacros: {
        TextMacrosConfiguration: module1,
        TextMacrosMethods: module2,
        TextParser: module3
      }
    }
  }
}});
