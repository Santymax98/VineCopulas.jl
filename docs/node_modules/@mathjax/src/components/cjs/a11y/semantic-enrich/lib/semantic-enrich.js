const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/semantic-enrich.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/semantic-enrich', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    "semantic-enrich": module1
  }
}});
