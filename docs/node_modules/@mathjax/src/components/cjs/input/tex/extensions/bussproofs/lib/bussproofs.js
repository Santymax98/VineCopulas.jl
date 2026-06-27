const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/bussproofs/BussproofsConfiguration.js');
const module2 = require('../../../../../../../cjs/input/tex/bussproofs/BussproofsItems.js');
const module3 = require('../../../../../../../cjs/input/tex/bussproofs/BussproofsMethods.js');
const module4 = require('../../../../../../../cjs/input/tex/bussproofs/BussproofsUtil.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/bussproofs', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      bussproofs: {
        BussproofsConfiguration: module1,
        BussproofsItems: module2,
        BussproofsMethods: module3,
        BussproofsUtil: module4
      }
    }
  }
}});
