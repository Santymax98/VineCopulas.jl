const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/ui/safe/SafeHandler.js');
const module2 = require('../../../../../cjs/ui/safe/SafeMethods.js');
const module3 = require('../../../../../cjs/ui/safe/safe.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('ui/safe', VERSION, 'ui');
}

combineWithMathJax({_: {
  ui: {
    safe: {
      SafeHandler: module1,
      SafeMethods: module2,
      safe: module3
    }
  }
}});
