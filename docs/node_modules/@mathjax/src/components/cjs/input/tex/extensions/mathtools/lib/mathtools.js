const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/mathtools/MathtoolsConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/mathtools/MathtoolsItems.js');
const module3 = require('../../../../../../../cjs/input/tex/mathtools/MathtoolsMethods.js');
const module4 = require('../../../../../../../cjs/input/tex/mathtools/MathtoolsTags.js');
const module5 = require('../../../../../../../cjs/input/tex/mathtools/MathtoolsUtil.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/mathtools', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      mathtools: {
        MathtoolsConfiguration: module1,
        MathtoolsItems: module2,
        MathtoolsMethods: module3,
        MathtoolsTags: module4,
        MathtoolsUtil: module5
      }
    }
  }
}});
