const {combineWithMathJax} = require('../../../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../../../cjs/components/version.js');

const module1 = require('../../../../../../../cjs/input/tex/tagformat/TagFormatConfiguration.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('[tex]/tagformat', VERSION, 'tex-extension');
}

combineWithMathJax({_: {
  input: {
    tex: {
      tagformat: {
        TagFormatConfiguration: module1
      }
    }
  }
}});
