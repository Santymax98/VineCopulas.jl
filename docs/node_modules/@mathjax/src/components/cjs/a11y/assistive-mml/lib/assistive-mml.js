const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/assistive-mml.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/assistive-mml', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    "assistive-mml": module1
  }
}});
