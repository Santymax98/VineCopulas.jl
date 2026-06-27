const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/complexity.js');
const module2 = require('../../../../../cjs/a11y/complexity/collapse.js');
const module3 = require('../../../../../cjs/a11y/complexity/visitor.js');
const module4 = require('../../../../../cjs/a11y/semantic-enrich.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/complexity', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    complexity_ts: module1,
    complexity: {
      collapse: module2,
      visitor: module3
    },
    "semantic-enrich": module4
  }
}});
