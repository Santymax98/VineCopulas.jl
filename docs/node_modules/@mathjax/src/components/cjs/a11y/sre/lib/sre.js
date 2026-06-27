const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/sre.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/sre', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    sre_ts: module1
  }
}});
