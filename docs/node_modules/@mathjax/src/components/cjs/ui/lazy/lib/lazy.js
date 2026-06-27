const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/ui/lazy/LazyHandler.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('ui/lazy', VERSION, 'ui');
}

combineWithMathJax({_: {
  ui: {
    lazy: {
      LazyHandler: module1
    }
  }
}});
