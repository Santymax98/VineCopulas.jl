const {combineWithMathJax} = require('../../../../cjs/components/global.js')
const {VERSION} = require('../../../../cjs/components/version.js');

const module1 = require('../../../../cjs/components/loader.js');
const module2 = require('../../../../cjs/components/package.js');
const module3 = require('../../../../cjs/components/startup.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('startup', VERSION, 'startup');
}

combineWithMathJax({_: {
  components: {
    loader: module1,
    package: module2,
    startup: module3
  }
}});
