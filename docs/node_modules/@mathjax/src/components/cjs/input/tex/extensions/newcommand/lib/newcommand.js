const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/newcommand/NewcommandConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/newcommand/NewcommandItems.js');
const module3 = require('../../../../../../../cjs/input/tex/newcommand/NewcommandMethods.js');
const module4 = require('../../../../../../../cjs/input/tex/newcommand/NewcommandUtil.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/newcommand', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      newcommand: {
        NewcommandConfiguration: module1,
        NewcommandItems: module2,
        NewcommandMethods: module3,
        NewcommandUtil: module4
      }
    }
  }
}});
