const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/color/ColorConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/color/ColorConstants.js');
const module3 = require('../../../../../../../cjs/input/tex/color/ColorMethods.js');
const module4 = require('../../../../../../../cjs/input/tex/color/ColorUtil.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/color', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      color: {
        ColorConfiguration: module1,
        ColorConstants: module2,
        ColorMethods: module3,
        ColorUtil: module4
      }
    }
  }
}});
