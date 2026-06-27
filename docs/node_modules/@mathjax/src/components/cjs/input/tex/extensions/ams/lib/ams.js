const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/ams/AmsConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/ams/AmsItems.js');
const module3 = require('../../../../../../../cjs/input/tex/ams/AmsMethods.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/ams', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      ams: {
        AmsConfiguration: module1,
        AmsItems: module2,
        AmsMethods: module3
      }
    }
  }
}});
