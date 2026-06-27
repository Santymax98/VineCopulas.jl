const {combineWithMathJax} = require('../../../../cjs/components/global.js')
const {VERSION} = require('../../../../cjs/components/version.js');

const module1 = require('../../../../cjs/components/loader.js');
const module2 = require('../../../../cjs/components/package.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('loader', VERSION, 'loader');
}

combineWithMathJax({_: {
  components: {
    loader: module1,
    package: module2
  }
}});
