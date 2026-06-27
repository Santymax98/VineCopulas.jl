const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/input/mathml.js');
const module2 = require('../../../../../cjs/input/mathml/FindMathML.js');
const module3 = require('../../../../../cjs/input/mathml/MathMLCompile.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/mml', VERSION, 'input');
}

combineWithMathJax({_: {
  input: {
    mathml_ts: module1,
    mathml: {
      FindMathML: module2,
      MathMLCompile: module3
    }
  }
}});
