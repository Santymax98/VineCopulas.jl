const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/adaptors/jsdomAdaptor.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('adaptors/jsdom', VERSION, 'adaptors');
}

combineWithMathJax({_: {
  adaptors: {
    jsdomAdaptor: module1
  }
}});
