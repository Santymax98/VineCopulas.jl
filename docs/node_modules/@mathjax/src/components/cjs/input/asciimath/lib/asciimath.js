const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/input/asciimath.js');
const module2 = require('../../../../../cjs/input/asciimath/FindAsciiMath.js');
const module3 = require('../../../../../cjs/input/asciimath/legacy.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/asciimath', VERSION, 'input');
}

combineWithMathJax({_: {
  input: {
    asciimath_ts: module1,
    asciimath: {
      FindAsciiMath: module2,
      legacy_ts: module3
    }
  }
}});
