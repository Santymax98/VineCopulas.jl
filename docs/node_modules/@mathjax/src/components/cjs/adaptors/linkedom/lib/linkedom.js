const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/adaptors/linkedomAdaptor.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('adaptors/linkedom', VERSION, 'adaptors');
}

combineWithMathJax({_: {
  adaptors: {
    linkedomAdaptor: module1
  }
}});
